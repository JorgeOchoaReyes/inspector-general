import {
  ToggleGroup,
  ToggleGroupItem,
} from "~/components/ui/toggle-group";

interface ToggleProps {
    value: string;
    options: {
        value: string;
        label: string;
    }[];
    onChange: (value: (string)) => void; 
}

export const Toggle: React.FC<ToggleProps> = ({ 
  options,
  value,
  onChange,
}) => {
  return (
    <ToggleGroup type={"single"} value={value} onValueChange={(e) => onChange(e)}>
      {
        options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))
      } 
    </ToggleGroup>
  );
};
