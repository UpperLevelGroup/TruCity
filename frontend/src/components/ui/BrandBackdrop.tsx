export default function BrandBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute
        inset-0
        z-[1]
        overflow-hidden
      "
    >
      {/* =====================================================
          LARGE GOLD CIRCLE

          Official TruCity Bright Golden Orange:
          #FFAD01
      ====================================================== */}

      <div
        className="
          absolute
          -left-[250px]
          top-[30px]
          h-[560px]
          w-[560px]
          rounded-full
          bg-brand-gold/90

          sm:-left-[220px]

          lg:-left-[185px]
          lg:h-[620px]
          lg:w-[620px]
        "
      />

      {/* =====================================================
          CENTRE BLUE GRADIENT CIRCLE

          Gradients are permitted on approved shapes.
      ====================================================== */}

      <div
        className="
          trucity-gradient
          absolute
          left-[27%]
          top-[48%]
          hidden
          h-[175px]
          w-[175px]
          rounded-full
          opacity-90

          lg:block
        "
      />

      {/* =====================================================
          RIGHT BLUE GRADIENT CIRCLE
      ====================================================== */}

      <div
        className="
          trucity-gradient
          absolute
          -right-[135px]
          top-[110px]
          hidden
          h-[360px]
          w-[360px]
          rounded-full
          opacity-90

          md:block

          lg:-right-[150px]
          lg:h-[420px]
          lg:w-[420px]
        "
      />
    </div>
  );
}