import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboardChart({ data, title, label }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: label,
        data: data.map((d) => d.value),
        backgroundColor: 'rgba(255, 140, 0, 0.7)',
        borderRadius: 6,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, color: '#fff', font: { size: 18 } },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
    },
  };
  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
      <Bar data={chartData} options={options} height={220} />
    </div>
  );
}
