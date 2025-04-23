import { z } from 'zod';

type RefineConfig = {
    schema: RegExp;
    message: string;
};
type System = "universal" | "macos" | "apfs" | "hfs+" | "linux" | "ext2" | "ext3" | "ext4" | "btrfs" | "xfs" | "zfs" | "jfs" | "f2fs" | "windows" | "ntfs" | "fat32" | "exfat" | "refs" | "udf" | "iso9660" | "fat16" | "fat12" | "ios" | "android";

declare const registry: Partial<Record<System, RefineConfig>>;

type MatcherArgs = {
    system: keyof typeof registry;
};
declare function matcher(args?: MatcherArgs): z.ZodString;
declare const zfn: {
    filename: typeof matcher;
};

export { zfn };
