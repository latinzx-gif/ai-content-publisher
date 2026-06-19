import AppKit
import SwiftUI

enum SidebarDestination: String, CaseIterable, Identifiable {
    case dashboard = "Project Dashboard"
    case createProject = "Create Project"
    case prdImport = "PRD Import"
    case agents = "Agent Library"
    case skills = "Skill Library"
    case teams = "Team Builder"
    case runtimes = "Runtime Manager"
    case tasks = "Task Board"
    case runs = "Run Log"
    case requests = "Human Request Inbox"
    case demo = "Demo / Handoff Center"

    var id: String { rawValue }

    var systemImage: String {
        switch self {
        case .dashboard: return "square.grid.2x2"
        case .createProject: return "plus.rectangle.on.folder"
        case .prdImport: return "doc.badge.plus"
        case .agents: return "person.3"
        case .skills: return "wand.and.stars"
        case .teams: return "person.2.crop.square.stack"
        case .runtimes: return "cpu"
        case .tasks: return "list.bullet.rectangle.portrait"
        case .runs: return "terminal"
        case .requests: return "bubble.left.and.exclamationmark.bubble.right"
        case .demo: return "shippingbox"
        }
    }
}

struct StudioShellView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var selection: SidebarDestination? = .dashboard

    private var sidebarIdealWidth: CGFloat {
        let font = NSFont.systemFont(ofSize: NSFont.systemFontSize)
        let longestLabel = SidebarDestination.allCases
            .map { ($0.rawValue as NSString).size(withAttributes: [.font: font]).width }
            .max() ?? 180
        return min(max(longestLabel + 58, 220), 300)
    }

    private var sidebarMinimumWidth: CGFloat {
        max(200, sidebarIdealWidth - 16)
    }

    private var sidebarMaximumWidth: CGFloat {
        min(340, sidebarIdealWidth + 28)
    }

    var body: some View {
        NavigationSplitView {
            List(SidebarDestination.allCases, selection: $selection) { item in
                Label(item.rawValue, systemImage: item.systemImage)
                    .tag(item)
            }
            .navigationTitle("Head Office Agent Studio")
            .navigationSplitViewColumnWidth(min: sidebarMinimumWidth, ideal: sidebarIdealWidth, max: sidebarMaximumWidth)
        } detail: {
            Group {
                switch selection ?? .dashboard {
                case .dashboard: DashboardView()
                case .createProject: CreateProjectView()
                case .prdImport: PRDImportView()
                case .agents: AgentLibraryView()
                case .skills: SkillLibraryView()
                case .teams: TeamBuilderView()
                case .runtimes: RuntimeManagerView()
                case .tasks: TaskBoardView()
                case .runs: RunLogView()
                case .requests: HumanRequestInboxView()
                case .demo: DemoHandoffCenterView()
                }
            }
        }
        .navigationSplitViewStyle(.balanced)
        .toolbar {
            ToolbarItem(placement: .status) {
                Text(store.bootstrapMessage.isEmpty ? "V1 shell ready" : store.bootstrapMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

struct DashboardView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var searchText = ""
    @State private var statusFilter = "all"
    @State private var priorityFilter = "all"
    @State private var expandedProjectID: UUID?
    @State private var editingProject: StudioProject?
    @State private var pendingDeleteProject: StudioProject?
    @State private var statusMessage = ""

    private var filteredProjects: [StudioProject] {
        store.projects.filter { project in
            let matchesSearch: Bool = {
                let needle = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
                guard !needle.isEmpty else { return true }
                return project.name.localizedCaseInsensitiveContains(needle)
                    || project.slug.localizedCaseInsensitiveContains(needle)
                    || project.clientLabel.localizedCaseInsensitiveContains(needle)
            }()

            let normalizedStatusFilter = statusFilter.trimmingCharacters(in: .whitespacesAndNewlines)
            let normalizedPriorityFilter = priorityFilter.trimmingCharacters(in: .whitespacesAndNewlines)
            let matchesStatus = normalizedStatusFilter.isEmpty || normalizedStatusFilter == "all" || project.status == normalizedStatusFilter
            let matchesPriority = normalizedPriorityFilter.isEmpty || normalizedPriorityFilter == "all" || project.priority == normalizedPriorityFilter
            return matchesSearch && matchesStatus && matchesPriority
        }
    }

    private var healthyWorkspaceCount: Int {
        store.projects.filter { FolderGeneratorService.workspaceHealth(for: $0).isHealthy }.count
    }

    private var needsRepairCount: Int {
        store.projects.filter { !FolderGeneratorService.workspaceHealth(for: $0).isHealthy }.count
    }

    private var archivedCount: Int {
        store.projects.filter { $0.status == "archived" }.count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(
                    title: "Project Dashboard",
                    subtitle: "Native macOS control room for project delivery, local files, and human-approved AI task loops."
                )

                GroupBox("Workspace Filters") {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack(spacing: 12) {
                            TextField("Search by project, slug, or client", text: $searchText)
                            Picker("Status", selection: $statusFilter) {
                                Text("All Statuses").tag("all")
                                ForEach(projectStatusOptions, id: \.self) { status in
                                    Text(status).tag(status)
                                }
                            }
                            .frame(width: 220)

                            Picker("Priority", selection: $priorityFilter) {
                                Text("All Priorities").tag("all")
                                ForEach(priorityOptions, id: \.self) { item in
                                    Text(item.capitalized).tag(item)
                                }
                            }
                            .frame(width: 180)
                        }

                        Text("Showing \(filteredProjects.count) of \(store.projects.count) projects")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.top, 8)
                }

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 16)], spacing: 16) {
                    DashboardStatCard(title: "Projects", value: "\(store.projects.count)", detail: "Persisted in SQLite")
                    DashboardStatCard(title: "Healthy Workspaces", value: "\(healthyWorkspaceCount)", detail: "All required folders present")
                    DashboardStatCard(title: "Needs Repair", value: "\(needsRepairCount)", detail: "One or more required folders missing")
                    DashboardStatCard(title: "Archived", value: "\(archivedCount)", detail: "Inactive records kept for history")
                }

                GroupBox("Projects") {
                    if filteredProjects.isEmpty {
                        emptyState("No matching projects", description: store.projects.isEmpty ? "Use Create Project to generate the local folder structure and first dashboard record." : "Adjust search or filters to see more projects.")
                    } else {
                        VStack(alignment: .leading, spacing: 12) {
                            ForEach(filteredProjects) { project in
                                ProjectRow(
                                    project: project,
                                    isExpanded: expandedProjectID == project.id,
                                    onToggleDetails: {
                                        expandedProjectID = expandedProjectID == project.id ? nil : project.id
                                    },
                                    onEdit: {
                                        editingProject = project
                                    },
                                    onArchive: {
                                        do {
                                            let archived = try store.archiveProject(id: project.id)
                                            statusMessage = "Archived project record: \(archived.name)"
                                        } catch {
                                            statusMessage = error.localizedDescription
                                        }
                                    },
                                    onDeleteRecord: {
                                        pendingDeleteProject = project
                                    },
                                    onRepair: {
                                        do {
                                            let report = try store.repairProjectWorkspace(projectID: project.id)
                                            statusMessage = report.isHealthy
                                                ? "Workspace repaired: \(project.name)"
                                                : "Repair incomplete for \(project.name): \(report.missingFolders.joined(separator: ", "))"
                                        } catch {
                                            statusMessage = error.localizedDescription
                                        }
                                    }
                                )
                                Divider()
                            }
                        }
                        .padding(.top, 6)
                    }
                }

                if !statusMessage.isEmpty {
                    Text(statusMessage)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                GroupBox("V1 Scope Notes") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("• Runtime execution remains manual/mock in this V1 shell.")
                        Text("• Project folders follow the PRD structure under ~/AgentStudio/Projects/{project-slug}/.")
                        Text("• PRD import stores original files, normalized markdown, and an analysis placeholder for planning.")
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.vertical, 4)
                }
            }
            .padding(24)
        }
        .onAppear {
            if statusFilter.isEmpty { statusFilter = "all" }
            if priorityFilter.isEmpty { priorityFilter = "all" }
        }
        .sheet(item: $editingProject) { project in
            ProjectEditSheet(project: project) { name, projectType, clientLabel, deadline, priority, outputGoal, notes in
                do {
                    let updated = try store.updateProject(
                        id: project.id,
                        name: name,
                        projectType: projectType,
                        clientLabel: clientLabel,
                        deadline: deadline,
                        priority: priority,
                        outputGoal: outputGoal,
                        notes: notes
                    )
                    statusMessage = "Updated project: \(updated.name)"
                } catch {
                    statusMessage = error.localizedDescription
                }
            }
        }
        .alert("Delete project record?", isPresented: Binding(
            get: { pendingDeleteProject != nil },
            set: { if !$0 { pendingDeleteProject = nil } }
        ), presenting: pendingDeleteProject) { project in
            Button("Delete", role: .destructive) {
                do {
                    try store.deleteProjectRecord(id: project.id)
                    statusMessage = "Deleted project record: \(project.name)"
                } catch {
                    statusMessage = error.localizedDescription
                }
                pendingDeleteProject = nil
            }
            Button("Cancel", role: .cancel) {
                pendingDeleteProject = nil
            }
        } message: { project in
            Text("This removes the SQLite record and related in-app items for \(project.name). Project folders on disk are left untouched.")
        }
    }
}

struct ProjectRow: View {
    @EnvironmentObject private var store: StudioStore
    let project: StudioProject
    let isExpanded: Bool
    let onToggleDetails: () -> Void
    let onEdit: () -> Void
    let onArchive: () -> Void
    let onDeleteRecord: () -> Void
    let onRepair: () -> Void

    private var healthReport: ProjectWorkspaceHealthReport {
        FolderGeneratorService.workspaceHealth(for: project)
    }

    private var teamSummary: String {
        let matches = store.teams.filter { $0.projectSlug == project.slug && !$0.isTemplate }
        if matches.isEmpty { return "No team assigned yet" }
        return matches.map(\.name).joined(separator: ", ")
    }

    private var openTaskCount: Int {
        store.tasks.filter { $0.projectSlug == project.slug && $0.status != "done" }.count
    }

    private var blockingRequestCount: Int {
        store.humanRequests.filter {
            $0.projectSlug == project.slug &&
            $0.isBlocking &&
            !["resolved", "closed", "cancelled"].contains($0.status.lowercased())
        }.count
    }

    private var demoChecklistCount: Int {
        store.demoItems.filter { $0.projectSlug == project.slug }.count
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(project.name)
                        .font(.headline)
                    Text(project.slug)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button(isExpanded ? "Hide Details" : "Show Details") {
                    onToggleDetails()
                }
                Button("Open Folder") {
                    AppDialogs.openInFinder(path: project.createdFolderPath.isEmpty ? project.baseFolderPath : project.createdFolderPath)
                }
                .disabled(project.createdFolderPath.isEmpty && project.baseFolderPath.isEmpty)
            }

            HStack(spacing: 12) {
                Label(project.projectType, systemImage: "shippingbox")
                Label(project.clientLabel, systemImage: "briefcase")
                Label(DateFormatter.studioDate.string(from: project.deadline), systemImage: "calendar")
                Label(project.priority.capitalized, systemImage: "flag")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)

            HStack(alignment: .center, spacing: 12) {
                Text("Status")
                    .font(.subheadline.weight(.medium))
                Picker("Status", selection: Binding(
                    get: { project.status },
                    set: { store.updateProjectStatus(id: project.id, status: $0) }
                )) {
                    ForEach(projectStatusOptions, id: \.self) { status in
                        Text(status).tag(status)
                    }
                }
                .labelsHidden()
                .frame(width: 220)

                Text(healthReport.isHealthy ? "Workspace Healthy" : "Missing \(healthReport.missingFolders.count) Folder(s)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(healthReport.isHealthy ? .green : .orange)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background((healthReport.isHealthy ? Color.green : Color.orange).opacity(0.12), in: Capsule())

                Spacer()

                Button("Edit") { onEdit() }
                Button("Repair Folders") { onRepair() }
                    .disabled(healthReport.isHealthy)
                Button("Archive") { onArchive() }
                Button("Delete Record", role: .destructive) { onDeleteRecord() }
            }

            if !project.outputGoal.isEmpty {
                Text(project.outputGoal)
                    .font(.subheadline)
            }

            if isExpanded {
                HStack(alignment: .top, spacing: 16) {
                    GroupBox("Project Detail") {
                        VStack(alignment: .leading, spacing: 8) {
                            detailLine(label: "Milestone", value: project.currentMilestone)
                            detailLine(label: "Workspace", value: healthReport.projectRootPath)
                            detailLine(label: "PRD Original", value: project.prdOriginalPath.isEmpty ? "—" : project.prdOriginalPath)
                            detailLine(label: "PRD Normalized", value: project.prdNormalizedPath.isEmpty ? "—" : project.prdNormalizedPath)
                            detailLine(label: "Notes", value: project.notes.isEmpty ? "—" : project.notes)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 6)
                    }

                    GroupBox("Workspace / Delivery Summary") {
                        VStack(alignment: .leading, spacing: 8) {
                            detailLine(label: "Assigned Team", value: teamSummary)
                            detailLine(label: "Open Tasks", value: "\(openTaskCount)")
                            detailLine(label: "Blocking Requests", value: "\(blockingRequestCount)")
                            detailLine(label: "Demo/Handoff Items", value: "\(demoChecklistCount)")
                            detailLine(label: "Required Folders", value: "\(healthReport.existingFolderCount)/\(healthReport.totalRequiredFolders)")
                            if !healthReport.missingFolders.isEmpty {
                                detailLine(label: "Missing", value: healthReport.missingFolders.joined(separator: ", "))
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 6)
                    }
                }
            }
        }
    }

    private func detailLine(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.caption)
                .textSelection(.enabled)
        }
    }
}

struct ProjectEditSheet: View {
    let project: StudioProject
    let onSave: (String, String, String, Date, String, String, String) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var name: String
    @State private var projectType: String
    @State private var clientLabel: String
    @State private var deadline: Date
    @State private var priority: String
    @State private var outputGoal: String
    @State private var notes: String

    init(project: StudioProject, onSave: @escaping (String, String, String, Date, String, String, String) -> Void) {
        self.project = project
        self.onSave = onSave
        _name = State(initialValue: project.name)
        _projectType = State(initialValue: project.projectType)
        _clientLabel = State(initialValue: project.clientLabel)
        _deadline = State(initialValue: project.deadline)
        _priority = State(initialValue: project.priority)
        _outputGoal = State(initialValue: project.outputGoal)
        _notes = State(initialValue: project.notes)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Edit Project")
                .font(.title2.weight(.semibold))
            TextField("Project name", text: $name)
            TextField("Project type", text: $projectType)
            TextField("Client / Internal label", text: $clientLabel)
            DatePicker("Deadline", selection: $deadline, displayedComponents: .date)
            Picker("Priority", selection: $priority) {
                ForEach(priorityOptions, id: \.self) { item in
                    Text(item.capitalized).tag(item)
                }
            }
            TextField("Output goal", text: $outputGoal, axis: .vertical)
                .lineLimit(3...5)
            TextField("Notes", text: $notes, axis: .vertical)
                .lineLimit(4...8)

            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Save") {
                    onSave(name, projectType, clientLabel, deadline, priority, outputGoal, notes)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(24)
        .frame(minWidth: 520)
    }
}

struct CreateProjectView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var projectName = ""
    @State private var projectType = "Internal Tool"
    @State private var clientLabel = "Internal"
    @State private var deadline = Date.now
    @State private var priority = "medium"
    @State private var outputGoal = ""
    @State private var baseFolderPath = StudioPaths.defaultProjectsRoot
    @State private var statusMessage = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Create Project", subtitle: "Generate the local delivery workspace and save the project record in SQLite.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Project Setup") {
                        VStack(alignment: .leading, spacing: 14) {
                            TextField("Project name", text: $projectName)
                            TextField("Project type", text: $projectType)
                            TextField("Client / Internal label", text: $clientLabel)
                            DatePicker("Deadline", selection: $deadline, displayedComponents: .date)
                            Picker("Priority", selection: $priority) {
                                ForEach(priorityOptions, id: \.self) { item in
                                    Text(item.capitalized).tag(item)
                                }
                            }
                            TextField("Output goal", text: $outputGoal, axis: .vertical)
                                .lineLimit(3...5)

                            HStack {
                                TextField("Base folder path", text: $baseFolderPath)
                                Button("Choose…") {
                                    if let folder = AppDialogs.chooseFolder() {
                                        baseFolderPath = folder.path
                                    }
                                }
                            }

                            HStack {
                                Button("Create Project") { createProject() }
                                    .buttonStyle(.borderedProminent)
                                    .disabled(projectName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                                Button("Open Root") {
                                    AppDialogs.openInFinder(path: baseFolderPath)
                                }
                            }

                            if !statusMessage.isEmpty {
                                Text(statusMessage)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.top, 8)
                    }

                    GroupBox("Folder Structure Preview") {
                        ScrollView {
                            Text(StudioPaths.treePreview(rootName: Slugifier.slug(from: projectName.isEmpty ? "project-name" : projectName)))
                                .font(.system(.body, design: .monospaced))
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .textSelection(.enabled)
                        }
                        .frame(minHeight: 260)
                    }
                }

                GroupBox("Recently Created") {
                    if store.projects.isEmpty {
                        emptyState("No projects yet", description: "Create your first project to start the delivery workflow.")
                    } else {
                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(store.projects.prefix(5)) { project in
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(project.name)
                                        Text(project.createdFolderPath)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Text(project.status)
                                        .foregroundStyle(.secondary)
                                }
                                Divider()
                            }
                        }
                        .padding(.top, 6)
                    }
                }
            }
            .padding(24)
        }
    }

    private func createProject() {
        let cleanedName = projectName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedName.isEmpty else {
            statusMessage = "Project name is required."
            return
        }

        do {
            let project = try store.createProject(
                name: cleanedName,
                projectType: projectType,
                clientLabel: clientLabel,
                deadline: deadline,
                priority: priority,
                outputGoal: outputGoal,
                baseFolderPath: baseFolderPath
            )
            statusMessage = "Project created at \(project.createdFolderPath)"
            projectName = ""
            outputGoal = ""
        } catch {
            statusMessage = error.localizedDescription
        }
    }
}

struct PRDImportView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var selectedProjectID: UUID?
    @State private var importMessage = ""

    private var selectedProject: StudioProject? {
        if let id = selectedProjectID {
            return store.projects.first(where: { $0.id == id })
        }
        return store.projects.first
    }

    private var generatedArtifacts: [String] {
        guard let project = selectedProject, !project.createdFolderPath.isEmpty else { return [] }
        let analysisRoot = URL(fileURLWithPath: project.createdFolderPath, isDirectory: true)
            .appendingPathComponent("02_PRD_Analysis", isDirectory: true)
        let expected = [
            "PRD_ANALYSIS.md",
            "MISSING_INFO.md",
            "SCOPE_SUMMARY.md",
            "MODULE_MAP.md",
            "ROLE_MAP.md",
            "RISK_REPORT.md",
            "ANALYST_CHECKLIST.md"
        ]
        return expected.map { analysisRoot.appendingPathComponent($0).path }
            .filter { FileManager.default.fileExists(atPath: $0) }
    }

    private var normalizedPreview: String {
        guard let project = selectedProject, !project.prdNormalizedPath.isEmpty,
              let content = try? String(contentsOfFile: project.prdNormalizedPath, encoding: .utf8) else {
            return "Import a PRD to preview normalized markdown here."
        }
        let trimmed = content.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "Normalized PRD is empty." }
        return String(trimmed.prefix(1600))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "PRD Import", subtitle: "Copy the source PRD into the project folder, normalize the text, and generate structured PRD analysis artifacts.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Import PRD") {
                        VStack(alignment: .leading, spacing: 14) {
                            Picker("Project", selection: Binding(
                                get: { selectedProjectID ?? store.projects.first?.id },
                                set: { selectedProjectID = $0 }
                            )) {
                                ForEach(store.projects) { project in
                                    Text(project.name).tag(Optional(project.id))
                                }
                            }
                            .disabled(store.projects.isEmpty)

                            HStack {
                                Button("Choose File and Import…") { importPRD() }
                                    .buttonStyle(.borderedProminent)
                                    .disabled(selectedProject == nil)

                                if let project = selectedProject, !project.prdOriginalPath.isEmpty {
                                    Button("Open Imported Folder") {
                                        AppDialogs.openInFinder(path: project.createdFolderPath)
                                    }
                                }
                            }

                            if let project = selectedProject {
                                VStack(alignment: .leading, spacing: 6) {
                                    Text("Project folder: \(project.createdFolderPath.isEmpty ? "Not created yet" : project.createdFolderPath)")
                                    Text("Original PRD: \(project.prdOriginalPath.isEmpty ? "—" : project.prdOriginalPath)")
                                    Text("Normalized Markdown: \(project.prdNormalizedPath.isEmpty ? "—" : project.prdNormalizedPath)")
                                    Text("Status: \(project.status)")
                                }
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            }

                            if !importMessage.isEmpty {
                                Text(importMessage)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(maxWidth: 460)

                    GroupBox("Generated Artifacts") {
                        if generatedArtifacts.isEmpty {
                            emptyState("No analysis artifacts yet", description: "Import a PRD to generate scope, module, role, risk, and analyst-checklist files.")
                        } else {
                            VStack(alignment: .leading, spacing: 8) {
                                ForEach(generatedArtifacts, id: \.self) { path in
                                    Text(path)
                                        .font(.caption)
                                        .textSelection(.enabled)
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.top, 8)
                        }
                    }
                }

                GroupBox("Normalized PRD Preview") {
                    ScrollView {
                        Text(normalizedPreview)
                            .font(.system(.body, design: .monospaced))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                    }
                    .frame(minHeight: 260)
                }

                GroupBox("What M3 Generates") {
                    Text("01_PRD/PRD_ORIGINAL.{ext}\n01_PRD/PRD_NORMALIZED.md\n01_PRD/PRD_IMPORT_LOG.md\n02_PRD_Analysis/PRD_ANALYSIS.md\n02_PRD_Analysis/MISSING_INFO.md\n02_PRD_Analysis/SCOPE_SUMMARY.md\n02_PRD_Analysis/MODULE_MAP.md\n02_PRD_Analysis/ROLE_MAP.md\n02_PRD_Analysis/RISK_REPORT.md\n02_PRD_Analysis/ANALYST_CHECKLIST.md")
                        .font(.system(.body, design: .monospaced))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .textSelection(.enabled)
                }
            }
            .padding(24)
        }
        .onAppear {
            selectedProjectID = store.projects.first?.id
        }
    }

    private func importPRD() {
        guard let project = selectedProject else {
            importMessage = "Create a project before importing a PRD."
            return
        }
        guard let fileURL = AppDialogs.choosePRDFile() else { return }

        do {
            let result = try store.importPRD(projectID: project.id, sourceURL: fileURL)
            importMessage = "Imported \(result.sourcePath) → \(result.copiedPath) • generated \(result.generatedArtifactPaths.count) analysis files"
        } catch {
            importMessage = error.localizedDescription
        }
    }
}

struct AgentLibraryView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var name = ""
    @State private var role = ""
    @State private var goal = ""
    @State private var runtimeName = "Mock Local Runtime"
    @State private var modelName = "mock-v1"
    @State private var skillNames = ""
    @State private var outputContract = "TASK_RESULT.md, CHANGED_FILES.md, RISK_NOTES.md"
    @State private var statusMessage = ""
    @State private var editingAgent: AgentDefinition?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Agent Library", subtitle: "Manage reusable AI worker profiles, their role definitions, and their manual/mock runtime mapping.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Create Agent") {
                        VStack(alignment: .leading, spacing: 12) {
                            TextField("Agent name", text: $name)
                            TextField("Role", text: $role)
                            TextField("Goal", text: $goal, axis: .vertical)
                                .lineLimit(3...5)
                            Picker("Runtime", selection: $runtimeName) {
                                ForEach(store.runtimes) { runtime in
                                    Text(runtime.name).tag(runtime.name)
                                }
                            }
                            TextField("Model", text: $modelName)
                            TextField("Skill names (comma-separated)", text: $skillNames)
                            TextField("Output contract", text: $outputContract)
                            Button("Save Agent") { createAgent() }
                                .buttonStyle(.borderedProminent)
                            Text("Editing support is now available from the list on the right.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            if !statusMessage.isEmpty {
                                Text(statusMessage).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(maxWidth: 360)

                    GroupBox("Available Agents") {
                        if store.agents.isEmpty {
                            emptyState("No agents", description: "Seed data should create the PRD default agents automatically.")
                        } else {
                            List {
                                ForEach(store.agents) { agent in
                                    VStack(alignment: .leading, spacing: 8) {
                                        HStack(alignment: .top) {
                                            VStack(alignment: .leading, spacing: 6) {
                                                Text(agent.name).font(.headline)
                                                Text(agent.role)
                                                    .font(.subheadline)
                                                Text(agent.goal)
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Text(agent.runtimeName)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Text("Model: \(agent.modelName)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Text("Skills: \(agent.skillNames)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        HStack(spacing: 8) {
                                            Button("Edit") {
                                                editingAgent = agent
                                            }
                                            Button("Delete") {
                                                store.deleteAgents([agent])
                                                statusMessage = "Deleted \(agent.name)"
                                            }
                                        }
                                        .buttonStyle(.bordered)
                                        .controlSize(.small)
                                    }
                                    .padding(.vertical, 4)
                                }
                            }
                            .frame(minHeight: 420)
                        }
                    }
                }
            }
            .padding(24)
        }
        .onAppear {
            runtimeName = store.runtimes.first?.name ?? "Mock Local Runtime"
        }
        .sheet(item: $editingAgent) { agent in
            AgentEditSheet(agent: agent) { name, role, goal, runtimeName, modelName, skillNames, outputContract in
                do {
                    let updated = try store.updateAgent(
                        id: agent.id,
                        name: name,
                        role: role,
                        goal: goal,
                        runtimeName: runtimeName,
                        modelName: modelName,
                        skillNames: skillNames,
                        outputContract: outputContract
                    )
                    statusMessage = "Updated \(updated.name)"
                } catch {
                    statusMessage = error.localizedDescription
                }
            }
        }
    }

    private func createAgent() {
        let cleanedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedName.isEmpty else {
            statusMessage = "Agent name is required."
            return
        }
        store.createAgent(
            name: cleanedName,
            role: role.isEmpty ? "Unspecified" : role,
            goal: goal,
            runtimeName: runtimeName,
            modelName: modelName,
            skillNames: skillNames,
            outputContract: outputContract
        )
        statusMessage = "Saved \(cleanedName)"
        resetCreateForm()
    }

    private func resetCreateForm() {
        name = ""
        role = ""
        goal = ""
        modelName = "mock-v1"
        skillNames = ""
        outputContract = "TASK_RESULT.md, CHANGED_FILES.md, RISK_NOTES.md"
        runtimeName = store.runtimes.first?.name ?? "Mock Local Runtime"
    }
}

struct SkillLibraryView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var name = ""
    @State private var type = "workflow"
    @State private var instruction = ""
    @State private var workflow = "Read context → produce output → hand off for review"
    @State private var checklist = ""
    @State private var outputContract = "Markdown summary"
    @State private var requiredTools = "SQLite store, local files"
    @State private var statusMessage = ""
    @State private var editingSkill: SkillDefinition?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Skill Library", subtitle: "Store reusable capability packages for agents, workflows, reviews, and output contracts.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Create Skill") {
                        VStack(alignment: .leading, spacing: 12) {
                            TextField("Skill name", text: $name)
                            Picker("Type", selection: $type) {
                                ForEach(skillTypeOptions, id: \.self) { item in
                                    Text(item.capitalized).tag(item)
                                }
                            }
                            TextField("Instruction", text: $instruction, axis: .vertical)
                                .lineLimit(3...4)
                            TextField("Workflow", text: $workflow, axis: .vertical)
                                .lineLimit(2...4)
                            TextField("Checklist", text: $checklist, axis: .vertical)
                                .lineLimit(2...4)
                            TextField("Output contract", text: $outputContract)
                            TextField("Required tools", text: $requiredTools)
                            Button("Save Skill") { createSkill() }
                                .buttonStyle(.borderedProminent)
                            Text("Existing skills can now be edited from the list on the right.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            if !statusMessage.isEmpty {
                                Text(statusMessage).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(maxWidth: 380)

                    GroupBox("Available Skills") {
                        if store.skills.isEmpty {
                            emptyState("No skills", description: "Seed data should populate the default V1 skills from the PRD.")
                        } else {
                            List {
                                ForEach(store.skills) { skill in
                                    VStack(alignment: .leading, spacing: 8) {
                                        HStack(alignment: .top) {
                                            VStack(alignment: .leading, spacing: 6) {
                                                Text(skill.name).font(.headline)
                                                Text(skill.instruction)
                                                    .font(.subheadline)
                                                Text(skill.workflow)
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Text(skill.type)
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Text("Checklist: \(skill.checklist)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Text("Output: \(skill.outputContract)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        HStack(spacing: 8) {
                                            Button("Edit") {
                                                editingSkill = skill
                                            }
                                            Button("Delete") {
                                                store.deleteSkills([skill])
                                                statusMessage = "Deleted \(skill.name)"
                                            }
                                        }
                                        .buttonStyle(.bordered)
                                        .controlSize(.small)
                                    }
                                    .padding(.vertical, 4)
                                }
                            }
                            .frame(minHeight: 420)
                        }
                    }
                }
            }
            .padding(24)
        }
        .sheet(item: $editingSkill) { skill in
            SkillEditSheet(skill: skill) { name, type, instruction, workflow, checklist, outputContract, requiredTools in
                do {
                    let updated = try store.updateSkill(
                        id: skill.id,
                        name: name,
                        type: type,
                        instruction: instruction,
                        workflow: workflow,
                        checklist: checklist,
                        outputContract: outputContract,
                        requiredTools: requiredTools
                    )
                    statusMessage = "Updated \(updated.name)"
                } catch {
                    statusMessage = error.localizedDescription
                }
            }
        }
    }

    private func createSkill() {
        let cleanedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedName.isEmpty else {
            statusMessage = "Skill name is required."
            return
        }
        store.createSkill(
            name: cleanedName,
            type: type,
            instruction: instruction,
            workflow: workflow,
            checklist: checklist,
            outputContract: outputContract,
            requiredTools: requiredTools
        )
        statusMessage = "Saved \(cleanedName)"
        resetCreateForm()
    }

    private func resetCreateForm() {
        name = ""
        type = "workflow"
        instruction = ""
        workflow = "Read context → produce output → hand off for review"
        checklist = ""
        outputContract = "Markdown summary"
        requiredTools = "SQLite store, local files"
    }
}

struct TeamBuilderView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var teamName = ""
    @State private var purpose = ""
    @State private var leadAgentName = "PM Agent"
    @State private var memberAgentNames = ""
    @State private var workflow = "Analyze → Build → Review → Audit"
    @State private var reviewRules = "Human approval before closure"
    @State private var runtimePreference = "Mock Local Runtime"
    @State private var projectSlug = "template"
    @State private var statusMessage = ""
    @State private var editingTeam: TeamDefinition?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Team Builder", subtitle: "Compose project teams from agent roles, define a lead, and save delivery workflow rules for each project.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Create Team") {
                        VStack(alignment: .leading, spacing: 12) {
                            TextField("Team name", text: $teamName)
                            TextField("Purpose", text: $purpose, axis: .vertical)
                                .lineLimit(2...4)
                            Picker("Lead Agent", selection: $leadAgentName) {
                                ForEach(store.agents) { agent in
                                    Text(agent.name).tag(agent.name)
                                }
                            }
                            TextField("Members (comma-separated)", text: $memberAgentNames)
                            Picker("Project", selection: $projectSlug) {
                                Text("Template").tag("template")
                                ForEach(store.projects) { project in
                                    Text(project.name).tag(project.slug)
                                }
                            }
                            TextField("Workflow", text: $workflow, axis: .vertical)
                                .lineLimit(2...4)
                            TextField("Review rules", text: $reviewRules, axis: .vertical)
                                .lineLimit(2...4)
                            TextField("Runtime preference", text: $runtimePreference)
                            Button("Save Team") { createTeam() }
                                .buttonStyle(.borderedProminent)
                            Text("Saved teams can now be edited, including project assignment.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            if !statusMessage.isEmpty {
                                Text(statusMessage).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(maxWidth: 380)

                    GroupBox("Saved Teams") {
                        if store.teams.isEmpty {
                            emptyState("No teams", description: "Seed data creates three default team templates for HR, Inventory, and AI Content work.")
                        } else {
                            List {
                                ForEach(store.teams) { team in
                                    VStack(alignment: .leading, spacing: 8) {
                                        HStack(alignment: .top) {
                                            VStack(alignment: .leading, spacing: 6) {
                                                Text(team.name).font(.headline)
                                                Text(team.purpose)
                                                    .font(.subheadline)
                                                Text("Lead: \(team.leadAgentName)")
                                                    .font(.caption)
                                                Text("Members: \(team.memberAgentNames)")
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                            }
                                            Spacer()
                                            Text(projectLabel(for: team))
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Text("Workflow: \(team.workflow)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Text("Runtime: \(team.runtimePreference)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        HStack(spacing: 8) {
                                            Button("Edit") {
                                                editingTeam = team
                                            }
                                            Button("Delete") {
                                                store.deleteTeams([team])
                                                statusMessage = "Deleted \(team.name)"
                                            }
                                        }
                                        .buttonStyle(.bordered)
                                        .controlSize(.small)
                                    }
                                    .padding(.vertical, 4)
                                }
                            }
                            .frame(minHeight: 420)
                        }
                    }
                }
            }
            .padding(24)
        }
        .onAppear {
            leadAgentName = store.agents.first?.name ?? "PM Agent"
            runtimePreference = store.runtimes.first?.name ?? "Mock Local Runtime"
        }
        .sheet(item: $editingTeam) { team in
            TeamEditSheet(team: team) { name, purpose, leadAgentName, memberAgentNames, workflow, reviewRules, runtimePreference, projectSlug in
                do {
                    let updated = try store.updateTeam(
                        id: team.id,
                        name: name,
                        purpose: purpose,
                        leadAgentName: leadAgentName,
                        memberAgentNames: memberAgentNames,
                        workflow: workflow,
                        reviewRules: reviewRules,
                        runtimePreference: runtimePreference,
                        projectSlug: projectSlug
                    )
                    statusMessage = "Updated \(updated.name)"
                } catch {
                    statusMessage = error.localizedDescription
                }
            }
        }
    }

    private func createTeam() {
        let cleanedName = teamName.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanedName.isEmpty else {
            statusMessage = "Team name is required."
            return
        }
        store.createTeam(
            name: cleanedName,
            purpose: purpose,
            leadAgentName: leadAgentName,
            memberAgentNames: memberAgentNames,
            workflow: workflow,
            reviewRules: reviewRules,
            runtimePreference: runtimePreference,
            projectSlug: projectSlug
        )
        statusMessage = "Saved \(cleanedName)"
        resetCreateForm()
    }

    private func resetCreateForm() {
        teamName = ""
        purpose = ""
        memberAgentNames = ""
        workflow = "Analyze → Build → Review → Audit"
        reviewRules = "Human approval before closure"
        leadAgentName = store.agents.first?.name ?? "PM Agent"
        runtimePreference = store.runtimes.first?.name ?? "Mock Local Runtime"
        projectSlug = "template"
    }

    private func projectLabel(for team: TeamDefinition) -> String {
        if team.projectSlug == "template" {
            return "Template"
        }
        if let project = store.projects.first(where: { $0.slug == team.projectSlug }) {
            return "\(project.name) • \(team.projectSlug)"
        }
        return team.projectSlug
    }
}

struct AgentEditSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: StudioStore

    let agent: AgentDefinition
    let onSave: (String, String, String, String, String, String, String) -> Void

    @State private var name: String
    @State private var role: String
    @State private var goal: String
    @State private var runtimeName: String
    @State private var modelName: String
    @State private var skillNames: String
    @State private var outputContract: String

    init(agent: AgentDefinition, onSave: @escaping (String, String, String, String, String, String, String) -> Void) {
        self.agent = agent
        self.onSave = onSave
        _name = State(initialValue: agent.name)
        _role = State(initialValue: agent.role)
        _goal = State(initialValue: agent.goal)
        _runtimeName = State(initialValue: agent.runtimeName)
        _modelName = State(initialValue: agent.modelName)
        _skillNames = State(initialValue: agent.skillNames)
        _outputContract = State(initialValue: agent.outputContract)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            pageHeader(title: "Edit Agent", subtitle: "Update the reusable worker profile without recreating the record.")
            TextField("Agent name", text: $name)
            TextField("Role", text: $role)
            TextField("Goal", text: $goal, axis: .vertical)
                .lineLimit(3...5)
            Picker("Runtime", selection: $runtimeName) {
                ForEach(store.runtimes) { runtime in
                    Text(runtime.name).tag(runtime.name)
                }
            }
            TextField("Model", text: $modelName)
            TextField("Skill names (comma-separated)", text: $skillNames)
            TextField("Output contract", text: $outputContract)
            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Save Changes") {
                    onSave(
                        name.trimmingCharacters(in: .whitespacesAndNewlines),
                        role.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Unspecified" : role,
                        goal,
                        runtimeName,
                        modelName,
                        skillNames,
                        outputContract
                    )
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(24)
        .frame(minWidth: 520)
    }
}

struct SkillEditSheet: View {
    @Environment(\.dismiss) private var dismiss

    let skill: SkillDefinition
    let onSave: (String, String, String, String, String, String, String) -> Void

    @State private var name: String
    @State private var type: String
    @State private var instruction: String
    @State private var workflow: String
    @State private var checklist: String
    @State private var outputContract: String
    @State private var requiredTools: String

    init(skill: SkillDefinition, onSave: @escaping (String, String, String, String, String, String, String) -> Void) {
        self.skill = skill
        self.onSave = onSave
        _name = State(initialValue: skill.name)
        _type = State(initialValue: skill.type)
        _instruction = State(initialValue: skill.instruction)
        _workflow = State(initialValue: skill.workflow)
        _checklist = State(initialValue: skill.checklist)
        _outputContract = State(initialValue: skill.outputContract)
        _requiredTools = State(initialValue: skill.requiredTools)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            pageHeader(title: "Edit Skill", subtitle: "Update the capability package and keep the same record id.")
            TextField("Skill name", text: $name)
            Picker("Type", selection: $type) {
                ForEach(skillTypeOptions, id: \.self) { item in
                    Text(item.capitalized).tag(item)
                }
            }
            TextField("Instruction", text: $instruction, axis: .vertical)
                .lineLimit(3...4)
            TextField("Workflow", text: $workflow, axis: .vertical)
                .lineLimit(2...4)
            TextField("Checklist", text: $checklist, axis: .vertical)
                .lineLimit(2...4)
            TextField("Output contract", text: $outputContract)
            TextField("Required tools", text: $requiredTools)
            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Save Changes") {
                    onSave(
                        name.trimmingCharacters(in: .whitespacesAndNewlines),
                        type,
                        instruction,
                        workflow,
                        checklist,
                        outputContract,
                        requiredTools
                    )
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(24)
        .frame(minWidth: 560)
    }
}

struct TeamEditSheet: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var store: StudioStore

    let team: TeamDefinition
    let onSave: (String, String, String, String, String, String, String, String) -> Void

    @State private var name: String
    @State private var purpose: String
    @State private var leadAgentName: String
    @State private var memberAgentNames: String
    @State private var workflow: String
    @State private var reviewRules: String
    @State private var runtimePreference: String
    @State private var projectSlug: String

    init(team: TeamDefinition, onSave: @escaping (String, String, String, String, String, String, String, String) -> Void) {
        self.team = team
        self.onSave = onSave
        _name = State(initialValue: team.name)
        _purpose = State(initialValue: team.purpose)
        _leadAgentName = State(initialValue: team.leadAgentName)
        _memberAgentNames = State(initialValue: team.memberAgentNames)
        _workflow = State(initialValue: team.workflow)
        _reviewRules = State(initialValue: team.reviewRules)
        _runtimePreference = State(initialValue: team.runtimePreference)
        _projectSlug = State(initialValue: team.projectSlug)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            pageHeader(title: "Edit Team", subtitle: "Update team membership, workflow, and project assignment.")
            TextField("Team name", text: $name)
            TextField("Purpose", text: $purpose, axis: .vertical)
                .lineLimit(2...4)
            Picker("Lead Agent", selection: $leadAgentName) {
                ForEach(store.agents) { agent in
                    Text(agent.name).tag(agent.name)
                }
            }
            TextField("Members (comma-separated)", text: $memberAgentNames)
            Picker("Project", selection: $projectSlug) {
                Text("Template").tag("template")
                ForEach(store.projects) { project in
                    Text(project.name).tag(project.slug)
                }
            }
            Picker("Runtime", selection: $runtimePreference) {
                ForEach(store.runtimes) { runtime in
                    Text(runtime.name).tag(runtime.name)
                }
            }
            TextField("Workflow", text: $workflow, axis: .vertical)
                .lineLimit(2...4)
            TextField("Review rules", text: $reviewRules, axis: .vertical)
                .lineLimit(2...4)
            HStack {
                Spacer()
                Button("Cancel") { dismiss() }
                Button("Save Changes") {
                    onSave(
                        name.trimmingCharacters(in: .whitespacesAndNewlines),
                        purpose,
                        leadAgentName,
                        memberAgentNames,
                        workflow,
                        reviewRules,
                        runtimePreference,
                        projectSlug
                    )
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .disabled(name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            }
        }
        .padding(24)
        .frame(minWidth: 580)
    }
}

struct RuntimeManagerView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var name = ""
    @State private var runtimeType = "mock"
    @State private var integrationMode = "manual"
    @State private var executionNotes = ""
    @State private var requiresApproval = true
    @State private var statusMessage = ""

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Runtime Manager", subtitle: "Track runtime readiness, default selections, and execution notes without enabling full autonomous execution yet.")

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Add Runtime") {
                        VStack(alignment: .leading, spacing: 12) {
                            TextField("Runtime name", text: $name)
                            TextField("Runtime type", text: $runtimeType)
                            TextField("Integration mode", text: $integrationMode)
                            TextField("Execution notes", text: $executionNotes, axis: .vertical)
                                .lineLimit(3...5)
                            Toggle("Require approval", isOn: $requiresApproval)
                            Button("Save Runtime") { createRuntime() }
                                .buttonStyle(.borderedProminent)
                            if !statusMessage.isEmpty {
                                Text(statusMessage).foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(maxWidth: 360)

                    GroupBox("Runtimes") {
                        if store.runtimes.isEmpty {
                            emptyState("No runtimes", description: "Seed data provides a default mock runtime plus planned CLI integrations.")
                        } else {
                            List {
                                ForEach(store.runtimes) { runtime in
                                    VStack(alignment: .leading, spacing: 6) {
                                        HStack(alignment: .center) {
                                            Text(runtime.name).font(.headline)
                                            Spacer()
                                            Text(readinessLabel(for: runtime))
                                                .font(.caption.weight(.semibold))
                                                .padding(.horizontal, 8)
                                                .padding(.vertical, 4)
                                                .background(readinessColor(for: runtime).opacity(0.16), in: Capsule())
                                                .foregroundStyle(readinessColor(for: runtime))
                                            Text(runtime.integrationMode)
                                                .foregroundStyle(.secondary)
                                        }
                                        Text(runtime.runtimeType)
                                            .font(.subheadline)
                                        Text(runtime.executionNotes)
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Text(runtime.requiresApproval ? "Approval required before launch" : "Planning-only actions can proceed without approval")
                                            .font(.caption2)
                                            .foregroundStyle(.secondary)
                                        Toggle("Default", isOn: Binding(
                                            get: { runtime.isDefault },
                                            set: { store.setDefaultRuntime(id: runtime.id, isDefault: $0) }
                                        ))
                                    }
                                    .padding(.vertical, 4)
                                }
                                .onDelete { offsets in
                                    let toDelete = offsets.map { store.runtimes[$0] }
                                    store.deleteRuntimes(toDelete)
                                }
                            }
                            .frame(minHeight: 420)
                        }
                    }
                }
            }
            .padding(24)
        }
    }

    private func createRuntime() {
        guard !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            statusMessage = "Runtime name is required."
            return
        }
        store.createRuntime(
            name: name,
            runtimeType: runtimeType,
            integrationMode: integrationMode,
            executionNotes: executionNotes,
            requiresApproval: requiresApproval
        )
        statusMessage = "Saved \(name)"
        name = ""
        executionNotes = ""
    }

    private func readinessLabel(for runtime: RuntimeProfile) -> String {
        if runtime.runtimeType == "mock" {
            return "ready"
        }

        switch runtime.integrationMode.lowercased() {
        case "planned":
            return "planned"
        case "manual":
            return "configured"
        default:
            return "unavailable"
        }
    }

    private func readinessColor(for runtime: RuntimeProfile) -> Color {
        switch readinessLabel(for: runtime) {
        case "ready":
            return .green
        case "configured":
            return .blue
        case "planned":
            return .orange
        default:
            return .red
        }
    }
}

struct TaskBoardView: View {
    @EnvironmentObject private var store: StudioStore

    @State private var selectedProjectSlug = ""
    @State private var taskCode = ""
    @State private var milestone = ""
    @State private var title = ""
    @State private var details = ""
    @State private var priority = "medium"
    @State private var assignedAgentName = "PM Agent"
    @State private var runtimeName = "Mock Local Runtime"
    @State private var acceptanceCriteria = ""
    @State private var dependencies = ""
    @State private var statusMessage = ""

    private var selectedProject: StudioProject? {
        store.projects.first(where: { $0.slug == selectedProjectSlug })
    }

    private var selectedRuntimeProfile: RuntimeProfile? {
        store.runtimes.first(where: { $0.name == runtimeName })
    }

    private var filteredTasks: [StudioTask] {
        store.tasks.filter { selectedProjectSlug.isEmpty || $0.projectSlug == selectedProjectSlug }
    }

    private var filteredRequests: [HumanRequestItem] {
        store.humanRequests.filter { selectedProjectSlug.isEmpty || $0.projectSlug == selectedProjectSlug }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Task Board", subtitle: "Manual/mock delivery pipeline for V1: guide tasks through Open → In Progress → Review → Audit → Done, while keeping gate requests and run evidence visible.")

                GroupBox("Board Controls") {
                    VStack(alignment: .leading, spacing: 12) {
                        Picker("Project", selection: $selectedProjectSlug) {
                            ForEach(store.projects) { project in
                                Text(project.name).tag(project.slug)
                            }
                        }
                        .disabled(store.projects.isEmpty)

                        HStack {
                            Button("Seed Initial Task Board") {
                                if let project = selectedProject {
                                    store.seedInitialTaskBoard(for: project, advanceProjectStage: true)
                                    statusMessage = "Seeded task board for \(project.name)"
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(selectedProject == nil)

                            Button("Generate Demo / Handoff Checklist") {
                                if let project = selectedProject {
                                    store.seedDemoAndHandoffChecklist(for: project)
                                    statusMessage = "Generated demo and handoff checklist for \(project.name)"
                                }
                            }
                            .disabled(selectedProject == nil)
                        }

                        if !statusMessage.isEmpty {
                            Text(statusMessage).foregroundStyle(.secondary)
                        }
                    }
                    .padding(.top, 8)
                }

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("New Task") {
                        VStack(alignment: .leading, spacing: 12) {
                            TextField("Task code", text: $taskCode)
                            TextField("Milestone", text: $milestone)
                            TextField("Title", text: $title)
                            TextField("Details", text: $details, axis: .vertical)
                                .lineLimit(3...5)
                            Picker("Priority", selection: $priority) {
                                ForEach(priorityOptions, id: \.self) { item in
                                    Text(item.capitalized).tag(item)
                                }
                            }
                            Picker("Assigned Agent", selection: $assignedAgentName) {
                                ForEach(store.agents) { agent in
                                    Text(agent.name).tag(agent.name)
                                }
                            }
                            Picker("Runtime", selection: $runtimeName) {
                                ForEach(store.runtimes) { runtime in
                                    Text(runtime.name).tag(runtime.name)
                                }
                            }
                            if let runtime = selectedRuntimeProfile {
                                Text("Readiness: \(runtime.integrationMode) • \(runtime.requiresApproval ? "Approval required" : "No approval required")")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            TextField("Acceptance criteria", text: $acceptanceCriteria, axis: .vertical)
                                .lineLimit(2...4)
                            TextField("Dependencies", text: $dependencies)
                            Button("Create Task") { createTask() }
                                .buttonStyle(.borderedProminent)
                                .disabled(selectedProject == nil || title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        }
                        .padding(.top, 8)
                    }
                    .frame(width: 360)

                    VStack(alignment: .leading, spacing: 16) {
                        GroupBox("Delivery Summary") {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 16)], spacing: 16) {
                                DashboardStatCard(title: "Open", value: "\(tasksForStage("open").count)", detail: "Backlog + waiting gates")
                                DashboardStatCard(title: "In Progress", value: "\(tasksForStage("in_progress").count)", detail: "Active work or fix loop")
                                DashboardStatCard(title: "Review", value: "\(tasksForStage("review").count)", detail: "Review gate pending")
                                DashboardStatCard(title: "Audit", value: "\(tasksForStage("audit").count)", detail: "Final sign-off gate")
                                DashboardStatCard(title: "Done", value: "\(tasksForStage("done").count)", detail: "Closed tasks")
                                DashboardStatCard(title: "Blocked", value: "\(filteredTasks.filter { $0.status == "blocked" || $0.status == "launch_blocked" }.count)", detail: "Needs human input")
                            }
                            .padding(.top, 8)
                        }

                        HStack(alignment: .top, spacing: 20) {
                            GroupBox("Primary Pipeline") {
                                if filteredTasks.isEmpty {
                                    emptyState("No tasks for this project", description: "Seed the initial board or create a manual task.")
                                } else {
                                    ScrollView(.horizontal) {
                                        HStack(alignment: .top, spacing: 16) {
                                            ForEach(taskPrimaryStageOptions, id: \.self) { stage in
                                                TaskStageColumn(
                                                    title: stageTitle(stage),
                                                    detail: stageDetail(stage),
                                                    tasks: tasksForStage(stage)
                                                )
                                            }
                                        }
                                        .padding(.vertical, 4)
                                    }
                                }
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)

                            GroupBox("Open Requests") {
                                if filteredRequests.isEmpty {
                                    emptyState("No open requests", description: "Review, audit, scope, and blocker gates will appear here.")
                                } else {
                                    VStack(alignment: .leading, spacing: 10) {
                                        ForEach(filteredRequests.filter { !["resolved", "closed", "cancelled", "answered"].contains($0.status.lowercased()) }) { request in
                                            RequestRailCard(request: request)
                                        }
                                    }
                                    .padding(.top, 8)
                                }
                            }
                            .frame(width: 320)
                        }
                    }
                }
            }
            .padding(24)
        }
        .onAppear {
            selectedProjectSlug = store.projects.first?.slug ?? ""
            assignedAgentName = store.agents.first?.name ?? "PM Agent"
            runtimeName = store.runtimes.first(where: { $0.isDefault })?.name ?? store.runtimes.first?.name ?? "Mock Local Runtime"
        }
    }

    private func tasksForStage(_ stage: String) -> [StudioTask] {
        filteredTasks.filter { store.primaryStage(for: $0) == stage }
    }

    private func stageTitle(_ stage: String) -> String {
        switch stage {
        case "open": return "Open"
        case "in_progress": return "In Progress"
        case "review": return "Review"
        case "audit": return "Audit"
        case "done": return "Done"
        default: return stage.capitalized
        }
    }

    private func stageDetail(_ stage: String) -> String {
        switch stage {
        case "open": return "Backlog + waiting approvals"
        case "in_progress": return "Executing or revising"
        case "review": return "Needs review decision"
        case "audit": return "Needs audit sign-off"
        case "done": return "Complete"
        default: return ""
        }
    }

    private func createTask() {
        guard let project = selectedProject else {
            statusMessage = "Select a project first."
            return
        }
        store.createTask(
            projectSlug: project.slug,
            taskCode: taskCode.isEmpty ? "T-\(filteredTasks.count + 1)" : taskCode,
            milestone: milestone.isEmpty ? "Manual" : milestone,
            title: title,
            details: details,
            priority: priority,
            assignedAgentName: assignedAgentName,
            runtimeName: runtimeName,
            acceptanceCriteria: acceptanceCriteria,
            dependencies: dependencies
        )
        statusMessage = "Created task \(taskCode.isEmpty ? "T-\(filteredTasks.count)" : taskCode)"
        taskCode = ""
        milestone = ""
        title = ""
        details = ""
        acceptanceCriteria = ""
        dependencies = ""
    }
}

struct TaskStageColumn: View {
    let title: String
    let detail: String
    let tasks: [StudioTask]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if tasks.isEmpty {
                RoundedRectangle(cornerRadius: 12)
                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                    .frame(width: 260, height: 140)
                    .overlay {
                        Text("Empty")
                            .foregroundStyle(.secondary)
                    }
            } else {
                ForEach(tasks) { task in
                    TaskCardView(task: task)
                }
            }
        }
        .frame(width: 290, alignment: .topLeading)
    }
}

struct TaskCardView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var statusMessage = ""
    let task: StudioTask

    private var runtimeProfile: RuntimeProfile? {
        store.runtimes.first(where: { $0.name == task.runtimeName })
    }

    private var stage: String {
        store.primaryStage(for: task)
    }

    private var openRequests: [HumanRequestItem] {
        store.openRequests(for: task)
    }

    private var latestLog: TaskRunLog? {
        store.latestRunLog(for: task)
    }

    private var primaryRequest: HumanRequestItem? {
        openRequests.first
    }

    private var approvalLabel: String {
        switch primaryRequest?.requestType ?? "" {
        case "audit":
            return "Approve & Done"
        case "review":
            return "Approve & Audit"
        default:
            return "Approve & Continue"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(task.taskCode)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                    Text(task.title)
                        .font(.headline)
                }
                Spacer()
                TaskBadgeView(text: task.priority.capitalized, tone: .neutral)
            }

            Text(task.milestone)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Text("\(task.assignedAgentName) • \(task.runtimeName)\(runtimeProfile.map { " • \($0.requiresApproval ? "approval required" : "approval optional")" } ?? "")")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 8) {
                TaskBadgeView(text: stageLabel(stage), tone: .accent)
                if let badge = store.taskStatusBadge(for: task) {
                    TaskBadgeView(text: badge, tone: badgeTone(for: task.status))
                }
            }

            if let request = primaryRequest {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 6) {
                        TaskBadgeView(text: requestTypeLabel(request.requestType), tone: .warning)
                        Text(request.status.capitalized)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Text(request.title)
                        .font(.subheadline.weight(.semibold))
                    if let intendedNextStep = request.intendedNextStep, !intendedNextStep.isEmpty {
                        Text(intendedNextStep)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(10)
                .background(Color.orange.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
            }

            if !task.resultSummary.isEmpty {
                Text(task.resultSummary)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if let latestLog {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Latest Log: \(latestLog.summary)")
                        .font(.caption)
                    if let artifactPath = latestLog.artifactPath, !artifactPath.isEmpty {
                        HStack(spacing: 8) {
                            Text(compactArtifactLabel(for: artifactPath))
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                            Button("Open Latest Artifact") {
                                AppDialogs.openInFinder(path: artifactPath)
                            }
                        }
                    }
                }
            }

            if !statusMessage.isEmpty {
                Text(statusMessage)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    primaryActionButton
                    secondaryStageButton
                }

                HStack(spacing: 8) {
                    Button("Prepare Runtime Brief") { prepareRuntimeBrief() }
                    Button("Approval Request") { createRuntimeRequest(template: "approval") }
                    Button("Scope Request") { createRuntimeRequest(template: "scope") }
                }
                .buttonStyle(.bordered)

                HStack(spacing: 8) {
                    if task.runtimeName.lowercased().contains("codex") || task.runtimeName.lowercased().contains("claude") || task.runtimeName.lowercased().contains("gemini") {
                        Button("Auth Request") { createRuntimeRequest(template: "auth") }
                    }
                    if task.status == "awaiting_approval" {
                        Button("Mark Launch Blocked") { markLaunchBlocked() }
                    }
                    if task.status == "launch_blocked" || task.status == "cancelled" || task.status == "done" {
                        Button("Reset to Open") { store.transitionTask(id: task.id, to: "todo") }
                    }
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(12)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 14))
    }

    @ViewBuilder
    private var primaryActionButton: some View {
        switch stage {
        case "open":
            Button(primaryRequest == nil ? "Start Work" : approvalLabel) {
                if let primaryRequest {
                    store.approveHumanRequest(
                        id: primaryRequest.id,
                        response: primaryRequest.userResponse.isEmpty ? "Approved from task board." : primaryRequest.userResponse
                    )
                } else if task.status == "awaiting_approval" {
                    store.transitionTask(id: task.id, to: "running")
                } else {
                    store.transitionTask(id: task.id, to: "running")
                }
            }
            .buttonStyle(.borderedProminent)
        case "in_progress":
            Button("Send to Review") {
                statusMessage = store.sendTaskToReview(taskID: task.id)
            }
            .buttonStyle(.borderedProminent)
        case "review":
            Button(primaryRequest == nil ? "Create Review Gate" : approvalLabel) {
                if let primaryRequest {
                    store.approveHumanRequest(
                        id: primaryRequest.id,
                        response: primaryRequest.userResponse.isEmpty ? "Review approved from task board." : primaryRequest.userResponse
                    )
                } else {
                    statusMessage = store.createStageGateRequest(taskID: task.id, requestType: "review")
                }
            }
            .buttonStyle(.borderedProminent)
        case "audit":
            Button(primaryRequest == nil ? "Create Audit Gate" : approvalLabel) {
                if let primaryRequest {
                    store.approveHumanRequest(
                        id: primaryRequest.id,
                        response: primaryRequest.userResponse.isEmpty ? "Audit approved from task board." : primaryRequest.userResponse
                    )
                } else {
                    statusMessage = store.createStageGateRequest(taskID: task.id, requestType: "audit")
                }
            }
            .buttonStyle(.borderedProminent)
        default:
            Button("Reset to Open") {
                store.transitionTask(id: task.id, to: "todo")
            }
            .buttonStyle(.borderedProminent)
        }
    }

    @ViewBuilder
    private var secondaryStageButton: some View {
        switch stage {
        case "open":
            Button("Queue Launch Approval") {
                queueLaunchApproval()
            }
            .buttonStyle(.bordered)
        case "in_progress":
            Button("Need Human Input") {
                store.transitionTask(id: task.id, to: "blocked")
            }
            .buttonStyle(.bordered)
        case "review", "audit":
            Button("Request Fix") {
                store.transitionTask(id: task.id, to: "need_fix")
            }
            .buttonStyle(.bordered)
        default:
            Button("Open Requests") {
                statusMessage = openRequests.isEmpty ? "No open requests linked to this task." : "Linked requests are visible in the Request rail and Inbox."
            }
            .buttonStyle(.bordered)
        }
    }

    private func prepareRuntimeBrief() {
        do {
            let path = try store.prepareRuntimeBrief(taskID: task.id)
            statusMessage = "Prepared brief at \(URL(fileURLWithPath: path).lastPathComponent)"
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    private func createRuntimeRequest(template: String) {
        statusMessage = store.createRuntimePlanningRequest(taskID: task.id, template: template)
    }

    private func queueLaunchApproval() {
        statusMessage = store.queueRuntimeApproval(taskID: task.id)
    }

    private func markLaunchBlocked() {
        statusMessage = store.markRuntimeLaunchBlocked(taskID: task.id)
    }

    private func stageLabel(_ value: String) -> String {
        switch value {
        case "open": return "Open"
        case "in_progress": return "In Progress"
        case "review": return "Review"
        case "audit": return "Audit"
        case "done": return "Done"
        default: return value.capitalized
        }
    }

    private func requestTypeLabel(_ value: String?) -> String {
        switch value ?? "blocker" {
        case "review": return "Review Gate"
        case "audit": return "Audit Gate"
        case "approval": return "Approval"
        case "scope": return "Scope"
        case "auth": return "Auth"
        default: return "Blocker"
        }
    }

    private func badgeTone(for status: String) -> TaskBadgeTone {
        switch status {
        case "blocked", "launch_blocked", "cancelled":
            return .danger
        case "need_fix", "awaiting_approval":
            return .warning
        default:
            return .neutral
        }
    }
}

struct RequestRailCard: View {
    let request: HumanRequestItem

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                TaskBadgeView(text: railRequestTypeLabel, tone: .warning)
                Spacer()
                Text(request.status.capitalized)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(request.title)
                .font(.subheadline.weight(.semibold))
            Text("Task: \(request.taskCode)")
                .font(.caption)
                .foregroundStyle(.secondary)
            if let intendedNextStep = request.intendedNextStep, !intendedNextStep.isEmpty {
                Text(intendedNextStep)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(10)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 12))
    }

    private var railRequestTypeLabel: String {
        switch request.requestType ?? "blocker" {
        case "review": return "Review"
        case "audit": return "Audit"
        case "approval": return "Approval"
        case "scope": return "Scope"
        case "auth": return "Auth"
        default: return "Blocker"
        }
    }
}

enum TaskBadgeTone {
    case accent
    case warning
    case danger
    case neutral
}

struct TaskBadgeView: View {
    let text: String
    let tone: TaskBadgeTone

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(backgroundColor, in: Capsule())
            .foregroundStyle(foregroundColor)
    }

    private var backgroundColor: Color {
        switch tone {
        case .accent:
            return .blue.opacity(0.14)
        case .warning:
            return .orange.opacity(0.16)
        case .danger:
            return .red.opacity(0.14)
        case .neutral:
            return .secondary.opacity(0.12)
        }
    }

    private var foregroundColor: Color {
        switch tone {
        case .accent:
            return .blue
        case .warning:
            return .orange
        case .danger:
            return .red
        case .neutral:
            return .secondary
        }
    }
}

struct RunLogView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var selectedProjectSlug = ""

    private var filteredLogs: [TaskRunLog] {
        store.runLogs.filter { selectedProjectSlug.isEmpty || $0.projectSlug == selectedProjectSlug }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Run Log", subtitle: "Structured evidence for each manual/mock transition: stage, artifact path, related request, error summary, and raw log text.")

                GroupBox("Filter") {
                    Picker("Project", selection: $selectedProjectSlug) {
                        Text("All Projects").tag("")
                        ForEach(store.projects) { project in
                            Text(project.name).tag(project.slug)
                        }
                    }
                    .padding(.top, 8)
                }

                GroupBox("Logs") {
                    if filteredLogs.isEmpty {
                        emptyState("No run logs", description: "Move a task through the board to generate execution history.")
                    } else {
                        VStack(alignment: .leading, spacing: 10) {
                            ForEach(filteredLogs) { log in
                                RunLogRowView(log: log)
                            }
                        }
                        .padding(.top, 8)
                    }
                }
            }
            .padding(24)
        }
    }
}

struct RunLogRowView: View {
    let log: TaskRunLog

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(log.taskCode) • \(log.taskTitle)")
                        .font(.headline)
                    Text("Runtime: \(log.runtimeName)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 4) {
                    TaskBadgeView(text: (log.stage ?? log.status).replacingOccurrences(of: "_", with: " ").capitalized, tone: badgeTone)
                    Text(DateFormatter.studioTimestamp.string(from: log.startedAt))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            Text(log.summary)
                .font(.subheadline)

            if let errorSummary = log.errorSummary, !errorSummary.isEmpty {
                Text("Error: \(errorSummary)")
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            if let relatedRequestTitle = log.relatedRequestTitle, !relatedRequestTitle.isEmpty {
                Text("Related Request: \(relatedRequestTitle)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            if let artifactPath = log.artifactPath, !artifactPath.isEmpty {
                HStack(spacing: 8) {
                    Text(compactArtifactLabel(for: artifactPath))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Button("Open Artifact") {
                        AppDialogs.openInFinder(path: artifactPath)
                    }
                }
            }

            DisclosureGroup("Raw Log") {
                Text(log.logText)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundStyle(.secondary)
                    .textSelection(.enabled)
                    .padding(.top, 6)
            }
        }
        .padding(12)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 14))
    }

    private var badgeTone: TaskBadgeTone {
        if log.errorSummary?.isEmpty == false || log.status == "need_fix" {
            return .danger
        }
        if log.status == "gate_open" || log.status == "request_open" {
            return .warning
        }
        if log.status == "done" {
            return .accent
        }
        return .neutral
    }
}

struct HumanRequestInboxView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var selectedProjectSlug = ""
    @State private var title = ""
    @State private var need = ""
    @State private var reason = ""
    @State private var priority = "medium"
    @State private var recommendedOption = ""

    private var filteredRequests: [HumanRequestItem] {
        store.humanRequests.filter { selectedProjectSlug.isEmpty || $0.projectSlug == selectedProjectSlug }
    }

    private var openRequests: [HumanRequestItem] {
        filteredRequests.filter { !["resolved", "closed", "cancelled", "answered"].contains($0.status.lowercased()) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Human Request Inbox", subtitle: "Review, audit, approval, scope, and blocker requests live here. Decisions here can move a task forward, send it back for fixes, or keep it blocked.")

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 170), spacing: 16)], spacing: 16) {
                    DashboardStatCard(title: "Open Requests", value: "\(openRequests.count)", detail: "Needs decision")
                    DashboardStatCard(title: "Review Gates", value: "\(openRequests.filter { ($0.requestType ?? "") == "review" }.count)", detail: "Waiting for review")
                    DashboardStatCard(title: "Audit Gates", value: "\(openRequests.filter { ($0.requestType ?? "") == "audit" }.count)", detail: "Waiting for sign-off")
                    DashboardStatCard(title: "Blockers", value: "\(openRequests.filter { ($0.requestType ?? "blocker") == "blocker" }.count)", detail: "Clarification needed")
                }

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("New Request") {
                        VStack(alignment: .leading, spacing: 12) {
                            Picker("Project", selection: $selectedProjectSlug) {
                                ForEach(store.projects) { project in
                                    Text(project.name).tag(project.slug)
                                }
                            }
                            .disabled(store.projects.isEmpty)
                            TextField("Title", text: $title)
                            TextField("Need", text: $need, axis: .vertical)
                                .lineLimit(3...5)
                            TextField("Reason", text: $reason, axis: .vertical)
                                .lineLimit(2...4)
                            Picker("Priority", selection: $priority) {
                                ForEach(priorityOptions, id: \.self) { item in
                                    Text(item.capitalized).tag(item)
                                }
                            }
                            TextField("Recommended option", text: $recommendedOption, axis: .vertical)
                                .lineLimit(2...4)
                            Button("Create Request") { createRequest() }
                                .buttonStyle(.borderedProminent)
                                .disabled(store.projects.isEmpty || title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        }
                        .padding(.top, 8)
                    }
                    .frame(width: 360)

                    GroupBox("Inbox") {
                        if filteredRequests.isEmpty {
                            emptyState("No requests", description: "Review gates, audit gates, and blockers will appear here, or create a request yourself.")
                        } else {
                            VStack(alignment: .leading, spacing: 10) {
                                ForEach(filteredRequests) { request in
                                    HumanRequestRow(request: request)
                                }
                            }
                            .padding(.top, 8)
                        }
                    }
                }
            }
            .padding(24)
        }
        .onAppear {
            selectedProjectSlug = store.projects.first?.slug ?? ""
        }
    }

    private func createRequest() {
        _ = store.createHumanRequest(
            projectSlug: selectedProjectSlug,
            taskCode: "manual",
            title: title,
            need: need,
            reason: reason,
            priority: priority,
            requestType: "blocker",
            linkedStage: "open",
            intendedNextStep: "Respond in the inbox so work can continue.",
            recommendedOption: recommendedOption
        )
        title = ""
        need = ""
        reason = ""
        recommendedOption = ""
    }
}

struct HumanRequestRow: View {
    @EnvironmentObject private var store: StudioStore
    let request: HumanRequestItem

    private var requestTypeLabel: String {
        switch request.requestType ?? "blocker" {
        case "review": return "Review Gate"
        case "audit": return "Audit Gate"
        case "approval": return "Approval"
        case "scope": return "Scope"
        case "auth": return "Auth"
        default: return "Blocker"
        }
    }

    private var linkedTask: StudioTask? {
        store.tasks.first {
            ($0.id == request.relatedTaskID) || (request.relatedTaskID == nil && $0.projectSlug == request.projectSlug && $0.taskCode == request.taskCode)
        }
    }

    private var approveLabel: String {
        switch request.requestType ?? "blocker" {
        case "review": return "Approve & Audit"
        case "audit": return "Approve & Done"
        default: return "Approve & Continue"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 6) {
                    HStack(spacing: 8) {
                        TaskBadgeView(text: requestTypeLabel, tone: .warning)
                        TaskBadgeView(text: request.status.capitalized, tone: .neutral)
                    }
                    Text(request.title)
                        .font(.headline)
                }
                Spacer()
                if request.isBlocking {
                    TaskBadgeView(text: "Blocking", tone: .danger)
                }
            }

            Text("Project: \(request.projectSlug) • Task: \(request.taskCode) • Priority: \(request.priority.capitalized)")
                .font(.caption)
                .foregroundStyle(.secondary)

            if let linkedTask {
                Text("Linked Task Stage: \(store.primaryStage(for: linkedTask).replacingOccurrences(of: "_", with: " ").capitalized)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Text(request.need)

            if !request.reason.isEmpty {
                Text("Reason: \(request.reason)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if let intendedNextStep = request.intendedNextStep, !intendedNextStep.isEmpty {
                Text("Next Step: \(intendedNextStep)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            if !request.recommendedOption.isEmpty {
                Text("Recommended: \(request.recommendedOption)")
                    .font(.caption)
            }

            TextField(
                "Response / decision note",
                text: Binding(
                    get: { request.userResponse },
                    set: { store.updateHumanRequestResponse(id: request.id, response: $0) }
                ),
                axis: .vertical
            )
            .lineLimit(2...4)

            HStack(spacing: 8) {
                Button(approveLabel) {
                    store.approveHumanRequest(
                        id: request.id,
                        response: request.userResponse.isEmpty ? "Approved from inbox." : request.userResponse
                    )
                }
                Button("Request Fix") {
                    store.requestFixForHumanRequest(
                        id: request.id,
                        response: request.userResponse.isEmpty ? "Please revise before the next gate." : request.userResponse
                    )
                }
                Button("Need Clarification") {
                    store.keepHumanRequestOpen(
                        id: request.id,
                        response: request.userResponse.isEmpty ? "Need more detail before proceeding." : request.userResponse
                    )
                }
                Button("Cancel Request") {
                    store.resolveHumanRequest(
                        id: request.id,
                        response: request.userResponse.isEmpty ? "Request cancelled." : request.userResponse,
                        status: "cancelled"
                    )
                }
                if request.status != "open" {
                    Button("Reopen") {
                        store.resolveHumanRequest(
                            id: request.id,
                            response: request.userResponse,
                            status: "open"
                        )
                    }
                }
            }
            .buttonStyle(.bordered)
        }
        .padding(12)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct DemoHandoffCenterView: View {
    @EnvironmentObject private var store: StudioStore
    @State private var selectedProjectSlug = ""
    @State private var itemType = "demo"
    @State private var title = ""
    @State private var details = ""
    @State private var owner = "Documentation Agent"
    @State private var knownLimitations = ""
    @State private var statusMessage = ""

    private var filteredItems: [DemoHandoffItem] {
        store.demoItems.filter { selectedProjectSlug.isEmpty || $0.projectSlug == selectedProjectSlug }
    }

    private var selectedProject: StudioProject? {
        store.projects.first(where: { $0.slug == selectedProjectSlug }) ?? store.projects.first
    }

    private var blockingRequestCount: Int {
        guard let project = selectedProject else { return 0 }
        return store.humanRequests.filter {
            $0.projectSlug == project.slug &&
            $0.isBlocking &&
            !["resolved", "closed", "cancelled"].contains($0.status.lowercased())
        }.count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                pageHeader(title: "Demo / Handoff Center", subtitle: "Prepare demo scripts, known limitations, handoff checklist templates, closure exports, and project close readiness in one place.")

                if let project = selectedProject {
                    HStack(spacing: 16) {
                        DashboardStatCard(title: "Blocking Requests", value: "\(blockingRequestCount)", detail: "Project closes only when this reaches zero.")
                        DashboardStatCard(
                            title: "Demo Items",
                            value: "\(filteredItems.filter { $0.itemType == "demo" }.count)",
                            detail: project.lastDemoScriptPath.map { compactArtifactLabel(for: $0) } ?? "No demo script generated yet"
                        )
                        DashboardStatCard(
                            title: "Handoff Items",
                            value: "\(filteredItems.filter { $0.itemType == "handoff" }.count)",
                            detail: project.lastHandoffChecklistPath.map { compactArtifactLabel(for: $0) } ?? "No handoff checklist generated yet"
                        )
                    }
                }

                HStack(alignment: .top, spacing: 20) {
                    GroupBox("Milestone 6 Actions") {
                        VStack(alignment: .leading, spacing: 12) {
                            Picker("Project", selection: $selectedProjectSlug) {
                                ForEach(store.projects) { project in
                                    Text(project.name).tag(project.slug)
                                }
                            }
                            .disabled(store.projects.isEmpty)

                            if let project = selectedProject {
                                Text("Status: \(project.status) • Milestone: \(project.currentMilestone)")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)

                                LazyVGrid(
                                    columns: [
                                        GridItem(.flexible(minimum: 220), spacing: 12),
                                        GridItem(.flexible(minimum: 220), spacing: 12)
                                    ],
                                    alignment: .leading,
                                    spacing: 12
                                ) {
                                    actionButton("Generate Checklist", systemImage: "checklist") { generateChecklist() }
                                    actionButton("Generate Demo Script", systemImage: "text.badge.star") { generateDemoScript() }
                                    actionButton("Handoff Checklist", systemImage: "list.bullet.clipboard") { generateHandoffChecklist() }
                                    actionButton("Export Summary", systemImage: "square.and.arrow.up", prominent: true) { exportClosureSummary() }
                                    actionButton("Close Project", systemImage: "lock.circle") { closeProject() }
                                    actionButton("Open Folder", systemImage: "folder") {
                                        AppDialogs.openInFinder(path: project.createdFolderPath)
                                    }
                                }

                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Known Limitations")
                                        .font(.headline)
                                    TextEditor(text: $knownLimitations)
                                        .frame(minHeight: 140)
                                        .font(.body)
                                    HStack(alignment: .center, spacing: 10) {
                                        Button("Save Known Limitations") { saveKnownLimitations() }
                                        if let closurePath = project.lastClosureSummaryPath {
                                            Spacer(minLength: 8)
                                            VStack(alignment: .trailing, spacing: 2) {
                                                Text("Last closure export")
                                                    .font(.caption2)
                                                    .foregroundStyle(.secondary)
                                                Text(compactArtifactLabel(for: closurePath))
                                                    .font(.caption)
                                                    .foregroundStyle(.secondary)
                                                    .textSelection(.enabled)
                                                    .lineLimit(1)
                                                    .help(closurePath)
                                            }
                                            Button("Open") {
                                                AppDialogs.openInFinder(path: closurePath)
                                            }
                                            .controlSize(.small)
                                        }
                                    }
                                }
                            } else {
                                emptyState("No projects available", description: "Create a project first to generate milestone 6 artifacts.")
                            }

                            Divider()

                            VStack(alignment: .leading, spacing: 10) {
                                Text("Add Custom Item")
                                    .font(.headline)
                                Picker("Type", selection: $itemType) {
                                    Text("Demo").tag("demo")
                                    Text("Handoff").tag("handoff")
                                }
                                TextField("Title", text: $title)
                                TextField("Details", text: $details, axis: .vertical)
                                    .lineLimit(3...5)
                                TextField("Owner", text: $owner)
                                Button("Save Item") { createItem() }
                                    .disabled(store.projects.isEmpty || title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                            }

                            if !statusMessage.isEmpty {
                                Text(statusMessage)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.top, 8)
                    }
                    .frame(width: 540)

                    GroupBox("Items") {
                        if filteredItems.isEmpty {
                            emptyState("No demo or handoff items", description: "Generate templates or add a custom item.")
                        } else {
                            List {
                                ForEach(filteredItems) { item in
                                    DemoHandoffRow(item: item)
                                }
                                .onDelete { offsets in
                                    let toDelete = offsets.map { filteredItems[$0] }
                                    store.deleteDemoItems(toDelete)
                                }
                            }
                            .frame(minHeight: 620)
                        }
                    }
                }
            }
            .padding(24)
        }
        .onAppear {
            selectedProjectSlug = store.projects.first?.slug ?? ""
            syncKnownLimitations()
        }
        .onChange(of: selectedProjectSlug) {
            syncKnownLimitations()
        }
    }

    private func syncKnownLimitations() {
        knownLimitations = selectedProject?.knownLimitations ?? ""
    }

    private func createItem() {
        store.createDemoItem(projectSlug: selectedProjectSlug, itemType: itemType, title: title, details: details, owner: owner)
        statusMessage = "Saved \(title)"
        title = ""
        details = ""
    }

    private func generateChecklist() {
        guard let project = selectedProject else { return }
        store.seedDemoAndHandoffChecklist(for: project)
        statusMessage = "Generated checklist for \(project.name)"
    }

    private func saveKnownLimitations() {
        guard let project = selectedProject else { return }
        store.updateKnownLimitations(projectID: project.id, text: knownLimitations)
        statusMessage = "Saved known limitations for \(project.name)"
        syncKnownLimitations()
    }

    private func generateDemoScript() {
        guard let project = selectedProject else { return }
        do {
            let path = try store.generateDemoScriptTemplate(projectID: project.id)
            statusMessage = "Generated demo script • \(compactArtifactLabel(for: path))"
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    private func generateHandoffChecklist() {
        guard let project = selectedProject else { return }
        do {
            let path = try store.generateHandoffChecklistTemplate(projectID: project.id)
            statusMessage = "Generated handoff checklist • \(compactArtifactLabel(for: path))"
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    private func exportClosureSummary() {
        guard let project = selectedProject else { return }
        do {
            let path = try store.exportClosureSummary(projectID: project.id)
            statusMessage = "Exported closure summary • \(compactArtifactLabel(for: path))"
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    private func closeProject() {
        guard let project = selectedProject else { return }
        do {
            statusMessage = try store.attemptCloseProject(projectID: project.id)
        } catch {
            statusMessage = error.localizedDescription
        }
    }

    @ViewBuilder
    private func actionButton(_ title: String, systemImage: String, prominent: Bool = false, action: @escaping () -> Void) -> some View {
        let content = VStack(spacing: 6) {
            Image(systemName: systemImage)
                .font(.headline)
            Text(title)
                .font(.subheadline.weight(.medium))
                .lineLimit(2)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, minHeight: 58)

        if prominent {
            Button(action: action) {
                content
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        } else {
            Button(action: action) {
                content
            }
            .buttonStyle(.bordered)
            .controlSize(.large)
        }
    }

    private func compactArtifactLabel(for path: String) -> String {
        let url = URL(fileURLWithPath: path)
        let fileName = url.lastPathComponent
        let folderName = url.deletingLastPathComponent().lastPathComponent
        return folderName.isEmpty ? fileName : "\(fileName) • \(folderName)"
    }
}

fileprivate func compactArtifactLabel(for path: String) -> String {
    let url = URL(fileURLWithPath: path)
    let fileName = url.lastPathComponent
    let folderName = url.deletingLastPathComponent().lastPathComponent
    return folderName.isEmpty ? fileName : "\(fileName) • \(folderName)"
}

struct DemoHandoffRow: View {
    @EnvironmentObject private var store: StudioStore
    let item: DemoHandoffItem

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(item.title)
                    .font(.headline)
                Spacer()
                Picker("Status", selection: Binding(
                    get: { item.status },
                    set: { store.updateDemoItemStatus(id: item.id, status: $0) }
                )) {
                    Text("pending").tag("pending")
                    Text("in_progress").tag("in_progress")
                    Text("done").tag("done")
                }
                .labelsHidden()
                .frame(width: 130)
            }
            Text("\(item.itemType.capitalized) • \(item.owner)")
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(item.details)
            if let artifactPath = item.artifactPath, !artifactPath.isEmpty {
                HStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(artifactName(from: artifactPath))
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.primary)
                            .textSelection(.enabled)
                        if let folderHint = artifactFolderHint(from: artifactPath) {
                            Text(folderHint)
                                .font(.caption2)
                                .foregroundStyle(.secondary)
                        }
                    }
                    Spacer()
                    Button("Open") {
                        AppDialogs.openInFinder(path: artifactPath)
                    }
                    .controlSize(.small)
                }
                .padding(10)
                .background(Color.secondary.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                .help(artifactPath)
            }
        }
        .padding(.vertical, 4)
    }

    private func artifactName(from path: String) -> String {
        URL(fileURLWithPath: path).lastPathComponent
    }

    private func artifactFolderHint(from path: String) -> String? {
        let folder = URL(fileURLWithPath: path).deletingLastPathComponent().lastPathComponent
        return folder.isEmpty ? nil : folder
    }
}

struct DashboardStatCard: View {
    let title: String
    let value: String
    let detail: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)
            Text(value)
                .font(.system(size: 32, weight: .semibold, design: .rounded))
            Text(detail)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 110, alignment: .leading)
        .padding(16)
        .background(.background.secondary, in: RoundedRectangle(cornerRadius: 18))
    }
}

@ViewBuilder
func pageHeader(title: String, subtitle: String) -> some View {
    VStack(alignment: .leading, spacing: 6) {
        Text(title)
            .font(.largeTitle.bold())
        Text(subtitle)
            .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
}

@ViewBuilder
func emptyState(_ title: String, description: String) -> some View {
    VStack(alignment: .leading, spacing: 6) {
        Text(title)
            .font(.headline)
        Text(description)
            .foregroundStyle(.secondary)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(.vertical, 8)
}
