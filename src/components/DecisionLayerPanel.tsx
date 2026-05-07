import { DecisionLayers, type DecisionLayerProps } from "@/components/DecisionLayer";
import { Panel } from "@/components/Cards";

type Props = {
  title?: string;
  subtitle?: string;
  items: DecisionLayerProps[];
};

export function DecisionLayerPanel({
  title = "Operating decisions",
  subtitle = "Signal → diagnosis → recommended action → expected impact → owner. Status badges (Open / In Progress / Closed) and confidence (High / Medium / Low). Synthetic GTC scenarios.",
  items,
}: Props) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <DecisionLayers items={items} />
    </Panel>
  );
}
