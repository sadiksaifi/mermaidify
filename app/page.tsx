import { ComponentExample } from "@/components/component-example";
import { ModeToggle } from "@/components/mode-toggle";

export default function Page() {
  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>
      <ComponentExample />
    </>
  );
}