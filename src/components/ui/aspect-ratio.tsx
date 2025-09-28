"use client";
//AspectRatio é um componente do Radix UI que é usado para criar um aspect ratio.
// doc em https://www.radix-ui.com/primitives/docs/components/aspect-ratio
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
