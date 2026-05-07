import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText
} from "@/components/ui/input-group";

type Input7Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  baseUrl?: string;
};

export function Input7({
  value,
  onChange,
  placeholder = "mans-profils",
  baseUrl = "https://zoptero.com/",
}: Input7Props) {
  return (
    <InputGroup>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-1!"
      />
      <InputGroupAddon>
        <InputGroupText>{baseUrl}</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  );
}

export default Input7;
