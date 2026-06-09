import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Burbuja de chat tipo viñeta.
 *
 *  - Usuario: fondo navy, alineada a la derecha. Texto plano (no interpreta Markdown
 *    de lo que escribe la persona).
 *  - GUNI: fondo blanco con borde suave, alineada a la izquierda, con avatar pequeño.
 *    La respuesta llega en Markdown (títulos, negritas, imágenes y enlaces) y se renderiza
 *    con react-markdown. Es seguro: react-markdown NO inyecta HTML crudo (sin rehype-raw),
 *    así que no hay riesgo de XSS desde el contenido del modelo.
 *
 * @param {Object} props
 * @param {"user"|"guni"} props.role - Autor del mensaje.
 * @param {string} props.text - Contenido del mensaje (Markdown si es GUNI).
 * @param {boolean} [props.isFallback=false] - Marca respuesta en modo orientación básica.
 * @param {React.ReactNode} [props.children] - Extra (p. ej. tarjetas de recomendación).
 */
function ChatBubble({ role, text, isFallback = false, children }) {
  const isGuni = role === "guni";
  const content = String(text ?? "");

  return (
    <div className={`fcp-msg fcp-msg--${isGuni ? "guni" : "user"}`}>
      {isGuni && (
        <span className="fcp-msg__avatar" aria-hidden="true">
          <img src="/images/guni/guni-original.png" alt="" className="fcp-avatar-img" />
        </span>
      )}

      <div className="fcp-bubble">
        {isFallback && (
          <span className="fcp-bubble__tag">Modo orientación básica</span>
        )}

        {isGuni ? (
          <div className="fcp-bubble__text fcp-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Enlaces seguros y que abren fuera sin filtrar el referer.
                a: ({ node, ...props }) => (
                  <a target="_blank" rel="noopener noreferrer" {...props} />
                ),
                // Imágenes perezosas (el alt lo provee el Markdown).
                img: ({ node, ...props }) => (
                  <img loading="lazy" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="fcp-bubble__text">
            {content.split("\n").map((line, index, lines) => (
              <React.Fragment key={index}>
                {line}
                {index < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}

export default ChatBubble;
