import { describe, test, expect } from "vitest";
import { execSync } from "child_process";

describe("Build Test", () => {
    test("Project should build without errors", () => {
        try {
            execSync("npm run build", { stdio: "inherit" }); // building...
            expect(true).toBe(true);
        } catch (error) { // if it doesn't build, error
            expect(error).toBeUndefined();
        }
    });
});
