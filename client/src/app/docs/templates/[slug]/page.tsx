"use client";
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from '@/components/ui/textarea';

export default function TemplateEditorPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="max-h-screen bg-zinc-950 text-white pt-5">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 capitalize">
          {slug.replace(/-/g, ' ')} Template
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button variant="default" className="w-full bg-zinc-600 hover:bg-zinc-700">Generate Auto-Fill</Button>
          <Button variant="outline" className="w-full bg-zinc-800 hover:bg-zinc-700">Upload Existing Doc</Button>
          <Button variant="outline" className="w-full bg-zinc-800 hover:bg-zinc-700">View Example</Button>
        </div>

        <Card className="bg-zinc-900 border border-zinc-700">
          <CardContent className="p-4">
            <Textarea
              placeholder="Start drafting your template here..."
              className="w-full h-[400px] resize-none bg-zinc-800 text-white border-none focus:ring-0 focus-visible:ring-0"
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" className='bg-red-800'>Discard</Button>
          <Button variant="default" className="bg-green-900 hover:bg-green-900">Save Template</Button>
        </div>
      </div>
    </div>
  );
}
