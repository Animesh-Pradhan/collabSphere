import { redirect } from "next/navigation";
import { use } from "react";

type Params = Promise<{ slug: string }>

export default function WorkspaceDetailsPage({ params }: { params: Params }) {
    const { slug } = use(params);
    redirect(`/workspaces/${slug}/overview`)
}