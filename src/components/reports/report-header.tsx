import Image from "next/image";

type ReportHeaderProps = {
  badge: React.ReactNode;
};

export function ReportHeader({ badge }: ReportHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-8 bg-linear-to-t from-blue-300 to-blue-100 px-8 py-6">
      <Image
        src="/logo-igreja.png"
        alt="Logo Igreja"
        width={100}
        height={100}
        className="w-full max-w-48"
      />
      <div className="flex flex-1 flex-col items-center">
        <div className="text-sm font-semibold tracking-widest uppercase">
          Relatórios Construção
        </div>
        <div className="text-5xl font-bold text-blue-900">AMERICANA</div>
        <div className="mt-2 rounded-full bg-blue-700 px-4 py-1 text-center text-sm font-bold text-white">
          {badge}
        </div>
      </div>
      <Image
        src="/logo-hora-milagrosa.png"
        alt="Logo Hora Milagrosa"
        width={100}
        height={100}
        className="w-full max-w-48"
      />
    </div>
  );
}
