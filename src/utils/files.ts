import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

export function getDirName(moduleUrl: string) {
    const filename = fileURLToPath(moduleUrl);
    return path.dirname(filename);
}

type ProcessFilesOptions = {
    filter?: (file: string) => boolean;
    apply?: (file: string) => Promise<void> | void;
};

/**
 * Find files in a directory recursively.
 * @param dir - The directory to search.
 * @param options - Options to apply to each file.
 * @returns The list of files.
 */
export async function processFiles(dir: string, { filter, apply }: ProcessFilesOptions): Promise<string[]> {
    const files: string[] = [];
    const queue: string[] = [dir];

    while (queue.length > 0) {
        const processingDir = queue.shift();
        if (!processingDir) continue;

        const entries = fs.readdirSync(processingDir, { withFileTypes: true });

        for (const entry of entries) {
            const file = path.join(processingDir, entry.name);

            if (entry.isDirectory()) {
                queue.push(file);
            } else {
                if (filter && !filter(file)) continue;
                if (apply) await apply(file);
                files.push(file);
            }
        }
    }

    return files;
}
