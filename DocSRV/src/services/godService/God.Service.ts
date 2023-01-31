import * as path from "path";
import * as fs from "fs";

class GodService {
    static globalConf: any = {};
    static loadGlobalConf() {
        let globalConfPath = path.join(
            __dirname,
            "../../configuration/DOCSRVconf.json"
        );
        let rawConf = fs.readFileSync(globalConfPath).toString();
        GodService.globalConf = JSON.parse(rawConf);
    }

    static clearEmptyResults() {
        let serverPath = path.join(
            GodService.globalConf.output.path,
            GodService.globalConf.output.folderName
        );
        GodService.deleteEmptyRecLigDirs(serverPath);
    }

    static deleteEmptyRecLigDirs(serverPath: string) {
        let receptorLigandDirs = fs.readdirSync(serverPath, {
            withFileTypes: true,
        });
        receptorLigandDirs.forEach((recLigDir) => {
            GodService.deleteEmptySitesDirs(path.join(serverPath, recLigDir.name));
        });
    }

    static deleteEmptySitesDirs(recLigDir: string) {
        let dirContent = fs.readdirSync(recLigDir, {
            withFileTypes: true,
        });
        let sitesDirs = dirContent.filter((file) => file.isDirectory());
        let deleted = 0;
        sitesDirs.forEach((siteDir) => {
            let toDel = GodService.deleteEmptyTimestampsDirs(
                path.join(recLigDir, siteDir.name)
            );
            if (toDel) deleted += 1;
        });
        if (deleted == sitesDirs.length) {
            fs.rmSync(recLigDir, { recursive: true, force: true });
        }
        return deleted == sitesDirs.length;
    }

    static deleteEmptyTimestampsDirs(siteDir: string) {
        let siteDirContent = fs.readdirSync(siteDir, { withFileTypes: true });
        let timestampsDirs = siteDirContent.filter((file) => file.isDirectory());
        let deleted = 0;
        timestampsDirs.forEach((timeDir) => {
            let toDel = GodService.deleteEmptyTriesDirs(
                path.join(siteDir, timeDir.name)
            );
            if (toDel) deleted += 1;
        });
        if (deleted == timestampsDirs.length) {
            fs.rmSync(siteDir, { recursive: true, force: true });
        }
        return deleted == timestampsDirs.length;
    }

    static deleteEmptyTriesDirs(timeDir: string): boolean {
        let timeDirContent = fs.readdirSync(timeDir, { withFileTypes: true });
        let triesDirs = timeDirContent.filter((file) => file.isDirectory());
        let deleted = 0;
        triesDirs.forEach((tryDir) => {
            let maybeDeleted = path.join(timeDir, tryDir.name);
            let finalDirContent = fs.readdirSync(maybeDeleted, {
                withFileTypes: true,
            });
            if (!finalDirContent.some((file) => file.name == "vinaOutput.json")) {
                fs.rmSync(maybeDeleted, { recursive: true, force: true });
                deleted += 1;
            }
        });
        if (deleted == triesDirs.length) {
            fs.rmSync(timeDir, { recursive: true, force: true });
        }
        return deleted == triesDirs.length;
    }

}

export { GodService };
