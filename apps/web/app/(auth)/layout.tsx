import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="text-black bg-gray-50 flex w-full items-center justify-center pt-6">
        <Image src={"/logo.webp"} alt="logo" width={80} height={80} />{" "}
      </div>
      {children}
    </>
  );
}
