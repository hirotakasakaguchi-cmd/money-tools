import type {
  SimulationUiFieldError,
  SimulationUiFieldPath,
} from "@/features/social-insurance/components/simulationUiState";

type FormFieldErrorMessagesProps = {
  errors: readonly SimulationUiFieldError[];
  fieldPath: SimulationUiFieldPath;
};

export function FormFieldErrorMessages({
  errors,
  fieldPath,
}: FormFieldErrorMessagesProps) {
  const messages = errors
    .filter((error) => error.fieldPath === fieldPath)
    .map((error) => error.message);

  if (messages.length === 0) {
    return null;
  }

  return (
    <ul className="mt-2 space-y-1 text-xs font-bold text-[#9a4f43]">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}
