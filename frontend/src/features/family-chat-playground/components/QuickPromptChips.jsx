import React from "react";

/**
 * Chips de prompts rápidos. Al pulsar uno se envía su texto como mensaje.
 *
 * @param {Object} props
 * @param {string[]} props.prompts - Lista de textos de chip.
 * @param {(prompt: string) => void} props.onSelect - Callback al pulsar un chip.
 * @param {boolean} [props.disabled=false] - Bloquea los chips mientras carga.
 */
function QuickPromptChips({ prompts, onSelect, disabled = false }) {
  return (
    <div className="fcp-chips" aria-label="Sugerencias rápidas">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          type="button"
          className="fcp-chip"
          disabled={disabled}
          onClick={() => onSelect(prompt)}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

export default QuickPromptChips;
