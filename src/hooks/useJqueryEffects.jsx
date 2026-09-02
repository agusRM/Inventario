import { useEffect } from "react";
import $ from "jquery";

// Hook personalizado que aplica animaciones y efectos con jQuery.
function useJqueryEffects({ mode, authenticated }) {
  useEffect(() => {
    const $inputs = $(".field input");
    const $cards = $(".auth-card, .welcome-card");

    $inputs.on("focus", function () {
      $(this).closest(".field").css("opacity", "1");
    });

    $inputs.on("blur", function () {
      if (!$(this).val()) {
        $(this).closest(".field").css("opacity", "0.92");
      }
    });

    // Animación de entrada para el formulario o la pantalla bienvenida.
    $cards.hide().fadeIn(700);

    return () => {
      $inputs.off("focus blur");
    };
  }, [mode, authenticated]);
}

export default useJqueryEffects;
