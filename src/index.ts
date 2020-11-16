#!/usr/bin/env node
import { execFile } from "child_process";
import { openSync, closeSync } from "fs";
import {readFile, writeFile} from "fs/promises";

const getArgs = () => {
    return process.argv.slice(2)
}

const getSelfIP = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        execFile("ip", ["addr"], (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            const lines = stdout.split("\n");

            const eth = lines.find(line => {
                const l = line.trim()
                return l.startsWith("inet ") && l.endsWith(" eth0")
            });
            if (!eth) {
                reject(new Error("Can't find IP"));
                return;
            }

            const ip = eth.trim().substring(5).split("/")[0];
            resolve(ip);
        });
    });
}

const updateHostsContents = (contents: string, replaceDomains: string[], replacementIP: string) => {
    return contents
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map(line => {
            if (!line || line.trim().startsWith("#")) { // Whitespace + # is still a comment
                return line;
            }
            const m = line.match(/([0-9.]+)(\s+)(.+)/)
            if (!m) {
                return line;
            }
            const [_, ip, whitespace, domain] = m;

            for (let i = 0; i < replaceDomains.length; i++) {
                const replaceDomain = replaceDomains[i];
                if ((replaceDomain.startsWith(".") && domain.endsWith(replaceDomain)) || domain === replaceDomain) {
                    return replacementIP + whitespace + domain;
                }
            }

            return line;
        })
        .join("\r\n");
}

const HOSTS_FILE_PATH = "/mnt/c/Windows/System32/drivers/etc/hosts";

const isHostsWritable = async (): Promise<boolean> => {
    try {
        const fd = openSync(HOSTS_FILE_PATH, "a");
        closeSync(fd);
        return true;
    }
    catch (e) {}
    return false;
}

const MORE = "Read more: https://github.com/dzek69/wsl2-dns or report the issue: " +
    "https://github.com/dzek69/wsl2-dns/issues/new";

(async () => {
    const writable = await isHostsWritable();
    if (!writable) {
        throw new Error("`hosts` file is not writable");
    }

    const args = getArgs();
    if (!args.length) {
        throw new Error(
            "Specify domains to update"
        );
    }

    let ip;
    try {
        ip = await getSelfIP();
    }
    catch (e) {
        if (e?.code === "ENOENT") {
            throw new Error("`ip addr` command failed to start");
        }
        throw new Error("Could not find IP address");
    }

    const hosts = String(await readFile(HOSTS_FILE_PATH))
    const updatedHosts = updateHostsContents(hosts, args, ip);

    const needsUpdate = hosts !== updatedHosts;
    if (needsUpdate) {
        await writeFile(HOSTS_FILE_PATH, updatedHosts);
    }

    console.info("Done,", needsUpdate ? "hosts file is now updated." : "hosts file did not require an update.");
})().catch(e => {
    console.error("wsl2-dns: Critical error occured:");
    console.error(e?.message);
    console.error(MORE)
});

export default 1; // to satisfy TypeScript
