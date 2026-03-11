import { SubmissionDetail } from "@/components/SubmissionDetail";

export default async function SubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ secret?: string }>;
}) {
  const { id } = await params;
  const { secret } = await searchParams;

  return (
    <SubmissionDetail
      submissionId={id}
      adminSecret={secret ?? ""}
    />
  );
}
