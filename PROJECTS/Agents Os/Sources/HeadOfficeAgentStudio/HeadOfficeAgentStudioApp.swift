import SwiftUI

@main
struct HeadOfficeAgentStudioApp: App {
    @StateObject private var store = StudioStore()

    var body: some Scene {
        WindowGroup("Head Office Agent Studio") {
            StudioShellView()
                .environmentObject(store)
        }
        .defaultSize(width: 1460, height: 940)
    }
}
