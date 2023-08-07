import { ChangeEvent, FocusEvent, useState } from "react";

interface Props {
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
}

export const EditableInput = ({ value, onChange, onBlur }: Props) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <input
        value={value}
        onChange={onChange}
        onBlur={(e) => {
          if (onBlur) {
            onBlur(e);
          }
          setEditing(false);
        }}
      />
    );
  } else {
    return (
      <div onClick={() => setEditing(true)} className="w-full h-full">
        {value || "(Name of task is empty)"}
      </div>
    );
  }
};
