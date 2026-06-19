#!/usr/bin/env python3
from __future__ import annotations

import plistlib
import shutil
import subprocess
from pathlib import Path

from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_IMAGE = PROJECT_ROOT / "Sources" / "HeadOfficeAgentStudio" / "Resources" / "TemporaryAppIcon.png"
BUILD_ROOT = PROJECT_ROOT / ".build"
PACKAGING_ROOT = PROJECT_ROOT / "packaging" / "macos"
DIST_ROOT = PROJECT_ROOT / "dist"
EXECUTABLE_NAME = "HeadOfficeAgentStudio"
APP_BUNDLE_NAME = "Head Office Agent Studio"
DISPLAY_NAME = "Head Office Agent Studio"
BUNDLE_ID = "com.headoffice.agentstudio.desktop"
ICON_NAME = "AppIcon"

ICON_SPECS = [
    ("icon_16x16.png", 16),
    ("icon_16x16@2x.png", 32),
    ("icon_32x32.png", 32),
    ("icon_32x32@2x.png", 64),
    ("icon_128x128.png", 128),
    ("icon_128x128@2x.png", 256),
    ("icon_256x256.png", 256),
    ("icon_256x256@2x.png", 512),
    ("icon_512x512.png", 512),
    ("icon_512x512@2x.png", 1024),
]


def run(command: list[str], cwd: Path | None = None) -> None:
    subprocess.run(command, cwd=str(cwd or PROJECT_ROOT), check=True)


def find_debug_binary() -> Path:
    matches = sorted(BUILD_ROOT.glob("*-apple-macosx/debug/HeadOfficeAgentStudio"))
    if not matches:
        raise FileNotFoundError("Could not find debug binary under .build/*-apple-macosx/debug/")
    return matches[0]


def find_resource_bundle() -> Path | None:
    matches = sorted(BUILD_ROOT.glob("*-apple-macosx/debug/HeadOfficeAgentStudio_HeadOfficeAgentStudio.bundle"))
    return matches[0] if matches else None


def prepare_master_icon() -> Path:
    PACKAGING_ROOT.mkdir(parents=True, exist_ok=True)
    master_path = PACKAGING_ROOT / f"{ICON_NAME}-master.png"

    image = Image.open(SOURCE_IMAGE).convert("RGBA")
    alpha_bbox = image.getchannel("A").getbbox()
    if alpha_bbox:
        image = image.crop(alpha_bbox)
    canvas_size = 1024
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))

    inset_ratio = 0.96
    max_side = int(canvas_size * inset_ratio)
    scale = min(max_side / image.width, max_side / image.height)
    resized_size = (
        max(1, int(round(image.width * scale))),
        max(1, int(round(image.height * scale)))
    )
    image = image.resize(resized_size, Image.Resampling.LANCZOS)

    offset = ((canvas_size - image.width) // 2, (canvas_size - image.height) // 2)
    canvas.paste(image, offset, image)
    canvas.save(master_path)
    return master_path


def build_icns(master_path: Path) -> Path:
    iconset_dir = PACKAGING_ROOT / f"{ICON_NAME}.iconset"
    if iconset_dir.exists():
        shutil.rmtree(iconset_dir)
    iconset_dir.mkdir(parents=True, exist_ok=True)

    master = Image.open(master_path).convert("RGBA")
    for filename, size in ICON_SPECS:
        resized = master.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(iconset_dir / filename)

    icns_path = PACKAGING_ROOT / f"{ICON_NAME}.icns"
    if icns_path.exists():
        icns_path.unlink()
    run(["iconutil", "-c", "icns", str(iconset_dir), "-o", str(icns_path)])
    return icns_path


def write_info_plist(plist_path: Path) -> None:
    plist_data = {
        "CFBundleDevelopmentRegion": "en",
        "CFBundleDisplayName": DISPLAY_NAME,
        "CFBundleExecutable": EXECUTABLE_NAME,
        "CFBundleIconFile": f"{ICON_NAME}.icns",
        "CFBundleIdentifier": BUNDLE_ID,
        "CFBundleInfoDictionaryVersion": "6.0",
        "CFBundleName": DISPLAY_NAME,
        "CFBundlePackageType": "APPL",
        "CFBundleShortVersionString": "1.0",
        "CFBundleVersion": "1",
        "LSMinimumSystemVersion": "14.0",
        "NSHighResolutionCapable": True,
        "NSPrincipalClass": "NSApplication",
    }
    with plist_path.open("wb") as fh:
        plistlib.dump(plist_data, fh)


def build_app_bundle(icns_path: Path, binary_path: Path, resource_bundle_path: Path | None) -> Path:
    app_dir = DIST_ROOT / f"{APP_BUNDLE_NAME}.app"
    contents_dir = app_dir / "Contents"
    macos_dir = contents_dir / "MacOS"
    resources_dir = contents_dir / "Resources"

    if app_dir.exists():
        shutil.rmtree(app_dir)

    macos_dir.mkdir(parents=True, exist_ok=True)
    resources_dir.mkdir(parents=True, exist_ok=True)

    target_binary = macos_dir / EXECUTABLE_NAME
    shutil.copy2(binary_path, target_binary)
    target_binary.chmod(0o755)

    shutil.copy2(icns_path, resources_dir / f"{ICON_NAME}.icns")
    write_info_plist(contents_dir / "Info.plist")

    if resource_bundle_path is not None:
        shutil.copytree(resource_bundle_path, resources_dir / resource_bundle_path.name, dirs_exist_ok=True)

    return app_dir


def main() -> None:
    if not SOURCE_IMAGE.exists():
        raise FileNotFoundError(f"Missing source image: {SOURCE_IMAGE}")

    DIST_ROOT.mkdir(parents=True, exist_ok=True)
    run(["swift", "build"])
    binary_path = find_debug_binary()
    resource_bundle_path = find_resource_bundle()
    master_path = prepare_master_icon()
    icns_path = build_icns(master_path)
    app_path = build_app_bundle(icns_path, binary_path, resource_bundle_path)

    print(f"APP={app_path}")
    print(f"ICNS={icns_path}")
    print(f"MASTER={master_path}")
    if resource_bundle_path is not None:
        print(f"RESOURCE_BUNDLE={resource_bundle_path}")


if __name__ == "__main__":
    main()
