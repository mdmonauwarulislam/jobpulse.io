import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboardChart({ data, title, label, type = 'bar', color = 'rgba(255, 140, 0, 0.7)' }) {
  const safeData = Array.isArray(data) ? data : [];

  const chartData = {
    labels: safeData.map((d) => d.label || d._id),
    datasets: [
      {
        label: label,
        data: safeData.map((d) => d.count || d.value || 0),
        backgroundColor: type === 'line' ? (color.replace('0.7', '0.2') || 'rgba(255, 140, 0, 0.2)') : color,
        borderColor: color.replace('0.7', '1') || 'rgba(255, 140, 0, 1)',
        borderWidth: 2,
        borderRadius: type === 'bar' ? 6 : 0,
        fill: type === 'line',
        tension: 0.4, // Smooth curve
        pointBackgroundColor: '#fff',
        pointBorderColor: color.replace('0.7', '1'),
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, color: '#e5e7eb', font: { size: 16, weight: 'normal' }, align: 'start', padding: { bottom: 20 } },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#9ca3af', precision: 0 },
        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] },
        beginAtZero: true
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-xl p-6 h-80 w-full">
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
}
