// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "HeadOfficeAgentStudio",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "HeadOfficeAgentStudio",
            targets: ["HeadOfficeAgentStudio"]
        )
    ],
    targets: [
        .executableTarget(
            name: "HeadOfficeAgentStudio",
            path: "Sources/HeadOfficeAgentStudio",
            resources: [
                .process("Resources")
            ],
            linkerSettings: [
                .linkedLibrary("sqlite3")
            ]
        )
    ]
)
