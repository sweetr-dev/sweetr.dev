import { Paper, Modal, ScrollArea, Image } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

interface ImageDemoProps {
  src: string;
  title: string;
  height?: number;
}

export const ImageDemo = ({ height = 200, src, title }: ImageDemoProps) => {
  const [isOpen, modalControl] = useDisclosure(false);

  return (
    <>
      <Paper withBorder>
        <Image
          src={src}
          height={height}
          width={702}
          onClick={() => modalControl.open()}
          style={{ cursor: "pointer", objectPosition: "top" }}
          radius="md"
          fallbackSrc="https://placehold.co/500x100?text=img"
        />
      </Paper>
      <Modal
        opened={isOpen}
        onClose={() => modalControl.close()}
        title={title}
        size="auto"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Image
          src={src}
          radius="md"
          fallbackSrc="https://placehold.co/500x100?text=img"
        />
      </Modal>
    </>
  );
};
