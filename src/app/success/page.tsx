import { Suspense } from "react";
import SuccessPage from "./SuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="py-20 text-center">加载中...</div>}>
      <SuccessPage />
    </Suspense>
  );
}
