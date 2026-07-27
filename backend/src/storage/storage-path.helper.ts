export class StoragePathHelper {
    private static tenantRoot(options: { organisationId?: string | null; userId?: string; }): string[] {
        if (options.organisationId) {
            return ["organizations", options.organisationId];
        }

        if (options.userId) {
            return ["personal", options.userId];
        }

        throw new Error("Unable to determine storage tenant.");
    }

    static documentAttachments(
        workspaceId: string, documentId: string,
        options: { organisationId?: string | null; userId?: string; },
    ): string {
        return [
            ...this.tenantRoot(options),
            "workspaces", workspaceId,
            "documents", documentId, "attachments",
        ].join("/");
    }
}