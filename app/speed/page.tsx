import { SpeedChart } from '@/components/speed/speed-chart';

async function getSpeedData() {
  const response = await fetch('https://www.17lands.com/data/play_draw', {
    next: { revalidate: 3600 }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch speed data');
  }
  return response.json();
}

export default async function SpeedPage() {
  const data = await getSpeedData();

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-8">
          赛制速度
        </h1>
        <SpeedChart initialData={data} />
      </div>
    </div>
  );
} 