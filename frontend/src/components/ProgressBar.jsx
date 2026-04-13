export default function ProgressBar({ progress }) {
  const textColor = progress > 50 ? 'text-gray-900' : 'text-white';

  return (
    <div className="relative w-full bg-gray-700 rounded-full h-6 overflow-hidden">
      <div
        className="h-6 rounded-full transition-all duration-500 bg-linear-to-r from-green-400 to-cyan-400"
        style={{
          width: `${progress}%`,
        }}
      ></div>

      <span
        className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-medium ${textColor}`}
      >
        {progress}%
      </span>
    </div>
  );
}