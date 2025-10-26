import WorkflowEditor from './WorkflowEditor'

export default function Page({ params }: { params:any }) {
  const { id } = params;
  
  return (
    <div className="min-h-screen bg-black">
      <WorkflowEditor params={params} />
    </div>
  );
}
