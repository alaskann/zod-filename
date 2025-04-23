export type RefineConfig = { schema: RegExp; message: string };

export type System =
  | "universal" // Generic placeholder, might represent common subset rules
  // macOS
  | "macos"
  | "apfs"
  | "hfs+"
  // Linux
  | "linux" // Added generic Linux type
  | "ext2"
  | "ext3"
  | "ext4"
  | "btrfs"
  | "xfs"
  | "zfs"
  | "jfs"
  | "f2fs" // Common in Android/Linux
  // Windows
  | "windows"
  | "ntfs"
  | "fat32"
  | "exfat"
  | "refs"
  // Cross-platform / Optical / Legacy
  | "udf" // Universal Disk Format (Optical media)
  | "iso9660" // CD/DVD ROMs
  | "fat16" // Older FAT
  | "fat12" // Older FAT
  // Mobile (Often abstractions over others like APFS/ext4)
  | "ios" // Represents iOS constraints (likely APFS based)
  | "android"; // Represents Android constraints (often ext4/f2fs based)

// Note: "linux" and "macos" from the original list are kept,
// though more specific types like "ext4" or "apfs" are usually preferred
