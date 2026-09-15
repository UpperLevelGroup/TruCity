import { useEffect, useState } from "react";

export interface SplashScreenProps {
  onFinish: () => void;
  minDisplayTime?: number;
}

export function SplashScreen({
  onFinish,
  minDisplayTime = 2600,
}: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => {
      setFadeOut(true);
    }, minDisplayTime);

    const finishTimer = window.setTimeout(() => {
      onFinish();
    }, minDisplayTime + 500);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [onFinish, minDisplayTime]);

  return (
    <>
      <style>
        {`
          @keyframes trucityLogoEnter {
            0% {
              opacity: 0;
              transform: translateY(18px) scale(0.92);
            }

            65% {
              opacity: 1;
              transform: translateY(-2px) scale(1.015);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes trucityHandshakeSettle {
            0%,
            100% {
              transform: translateY(0) rotate(0deg);
            }

            20% {
              transform: translateY(-2px) rotate(-0.6deg);
            }

            40% {
              transform: translateY(2px) rotate(0.6deg);
            }

            60% {
              transform: translateY(-1px) rotate(-0.35deg);
            }

            80% {
              transform: translateY(1px) rotate(0.35deg);
            }
          }

          @keyframes trucityAccentEnter {
            0% {
              opacity: 0;
              transform: scaleX(0.25);
            }

            100% {
              opacity: 1;
              transform: scaleX(1);
            }
          }

          @keyframes trucityDotEnter {
            0% {
              opacity: 0;
              transform: scale(0.45);
            }

            70% {
              opacity: 1;
              transform: scale(1.2);
            }

            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes trucityDotPulse {
            0%,
            100% {
              transform: scale(1);
            }

            50% {
              transform: scale(1.22);
            }
          }

          .trucity-splash-logo {
            opacity: 0;
            animation:
              trucityLogoEnter
              700ms
              cubic-bezier(0.22, 1, 0.36, 1)
              120ms
              forwards;
          }

          .trucity-splash-handshake {
            animation:
              trucityHandshakeSettle
              420ms
              ease-in-out
              920ms
              2;
            transform-origin: center center;
          }

          .trucity-splash-line-left {
            opacity: 0;
            animation:
              trucityAccentEnter
              550ms
              ease-out
              1050ms
              forwards;
            transform-origin: right center;
          }

          .trucity-splash-line-right {
            opacity: 0;
            animation:
              trucityAccentEnter
              550ms
              ease-out
              1050ms
              forwards;
            transform-origin: left center;
          }

          .trucity-splash-dot-1 {
            opacity: 0;
            animation:
              trucityDotEnter
              420ms
              ease-out
              1120ms
              forwards,
              trucityDotPulse
              850ms
              ease-in-out
              1600ms
              1;
          }

          .trucity-splash-dot-2 {
            opacity: 0;
            animation:
              trucityDotEnter
              420ms
              ease-out
              1220ms
              forwards,
              trucityDotPulse
              850ms
              ease-in-out
              1700ms
              1;
          }

          .trucity-splash-dot-3 {
            opacity: 0;
            animation:
              trucityDotEnter
              420ms
              ease-out
              1320ms
              forwards,
              trucityDotPulse
              850ms
              ease-in-out
              1800ms
              1;
          }

          @media (prefers-reduced-motion: reduce) {
            .trucity-splash-logo,
            .trucity-splash-handshake,
            .trucity-splash-line-left,
            .trucity-splash-line-right,
            .trucity-splash-dot-1,
            .trucity-splash-dot-2,
            .trucity-splash-dot-3 {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
        `}
      </style>

      <div
        className={`
          fixed
          inset-0
          z-50
          flex
          items-center
          justify-center
          overflow-hidden
          bg-[#F8FCFF]
          font-sans
          transition-opacity
          duration-500

          ${
            fadeOut
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }
        `}
      >
        {/* =================================================
            MAIN BRAND
        ================================================== */}

        <div
          className="
            relative
            z-10
            flex
            w-full
            flex-col
            items-center
            justify-center
            px-6
          "
        >
          {/* ===============================================
              FULL TRUCITY BRAND ARTWORK
          ================================================ */}

          <div
            className="
              trucity-splash-logo
              flex
              items-center
              justify-center
            "
          >
            <div
              className="
                trucity-splash-handshake
                flex
                items-center
                justify-center
              "
            >
              <img
                src="/Logo TruCity.png"
                alt="TruCity"
                draggable={false}
                className="
                  block
                  h-auto
                  w-[290px]
                  select-none
                  object-contain

                  sm:w-[360px]
                  md:w-[420px]
                  lg:w-[460px]
                "
              />
            </div>
          </div>

          {/* ===============================================
              BRAND ACCENT
          ================================================ */}

          <div
            aria-hidden="true"
            className="
              -mt-3
              flex
              items-center
              justify-center
              gap-3

              sm:-mt-4
            "
          >
            <span
              className="
                trucity-splash-line-left
                h-px
                w-9
                bg-[#00466D]

                sm:w-11
              "
            />

            <span
              className="
                trucity-splash-dot-1
                h-2.5
                w-2.5
                rounded-full
              "
              style={{
                backgroundColor: "#00466D",
              }}
            />

            <span
              className="
                trucity-splash-dot-2
                h-2.5
                w-2.5
                rounded-full
              "
              style={{
                backgroundColor: "#FFAD01",
              }}
            />

            <span
              className="
                trucity-splash-dot-3
                h-2.5
                w-2.5
                rounded-full
              "
              style={{
                backgroundColor: "#1E92D2",
              }}
            />

            <span
              className="
                trucity-splash-line-right
                h-px
                w-9
                bg-[#00466D]

                sm:w-11
              "
            />
          </div>
        </div>
      </div>
    </>
  );
}
