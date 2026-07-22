import type {
  FormFieldPath,
  FormValidationError,
} from "@/features/social-insurance/v2/formTypes";

type FormFieldErrorMessagesProps = {
  errors: readonly FormValidationError[];
  fieldPath: FormFieldPath;
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
