import Foundation

protocol StudioRecord: Codable, Identifiable, Hashable where ID == UUID {
    static var recordType: String { get }
}

struct StudioProject: StudioRecord {
    static let recordType = "project"

    var id: UUID = UUID()
    var name: String
    var slug: String
    var projectType: String
    var clientLabel: String
    var deadline: Date
    var priority: String
    var outputGoal: String
    var baseFolderPath: String
    var createdFolderPath: String
    var status: String
    var currentMilestone: String
    var prdOriginalPath: String
    var prdNormalizedPath: String
    var notes: String
    var knownLimitations: String?
    var lastDemoScriptPath: String?
    var lastHandoffChecklistPath: String?
    var lastClosureSummaryPath: String?
    var createdAt: Date
    var updatedAt: Date
}

struct AgentDefinition: StudioRecord {
    static let recordType = "agent"

    var id: UUID = UUID()
    var name: String
    var role: String
    var goal: String
    var runtimeName: String
    var modelName: String
    var skillNames: String
    var toolsPermission: String
    var memoryScope: String
    var outputContract: String
    var safetyRules: String
    var createdAt: Date
    var updatedAt: Date
}

struct SkillDefinition: StudioRecord {
    static let recordType = "skill"

    var id: UUID = UUID()
    var name: String
    var type: String
    var instruction: String
    var workflow: String
    var checklist: String
    var outputContract: String
    var requiredTools: String
    var createdAt: Date
    var updatedAt: Date
}

struct TeamDefinition: StudioRecord {
    static let recordType = "team"

    var id: UUID = UUID()
    var name: String
    var purpose: String
    var leadAgentName: String
    var memberAgentNames: String
    var workflow: String
    var reviewRules: String
    var runtimePreference: String
    var projectSlug: String
    var isTemplate: Bool
    var createdAt: Date
    var updatedAt: Date
}

struct RuntimeProfile: StudioRecord {
    static let recordType = "runtime"

    var id: UUID = UUID()
    var name: String
    var runtimeType: String
    var integrationMode: String
    var executionNotes: String
    var requiresApproval: Bool
    var isDefault: Bool
    var createdAt: Date
    var updatedAt: Date
}

struct StudioTask: StudioRecord {
    static let recordType = "task"

    var id: UUID = UUID()
    var projectSlug: String
    var taskCode: String
    var milestone: String
    var title: String
    var details: String
    var priority: String
    var status: String
    var assignedAgentName: String
    var runtimeName: String
    var acceptanceCriteria: String
    var dependencies: String
    var resultSummary: String
    var createdAt: Date
    var updatedAt: Date
}

struct TaskRunLog: StudioRecord {
    static let recordType = "run-log"

    var id: UUID = UUID()
    var projectSlug: String
    var taskCode: String
    var taskTitle: String
    var runtimeName: String
    var status: String
    var summary: String
    var logText: String
    var stage: String?
    var artifactPath: String?
    var relatedRequestID: UUID?
    var relatedRequestTitle: String?
    var errorSummary: String?
    var startedAt: Date
    var endedAt: Date?
}

struct HumanRequestItem: StudioRecord {
    static let recordType = "human-request"

    var id: UUID = UUID()
    var projectSlug: String
    var taskCode: String
    var relatedTaskID: UUID?
    var title: String
    var need: String
    var reason: String
    var priority: String
    var isBlocking: Bool
    var status: String
    var requestType: String?
    var linkedStage: String?
    var intendedNextStep: String?
    var recommendedOption: String
    var userResponse: String
    var createdAt: Date
    var updatedAt: Date
}

struct DemoHandoffItem: StudioRecord {
    static let recordType = "demo-handoff"

    var id: UUID = UUID()
    var projectSlug: String
    var itemType: String
    var title: String
    var details: String
    var status: String
    var owner: String
    var artifactPath: String?
    var createdAt: Date
    var updatedAt: Date
}
