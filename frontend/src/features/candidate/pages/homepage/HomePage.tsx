import { useNavigate } from 'react-router-dom';

interface HomepageProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

export function Homepage({
  onLogin,
  onSignUp,
}: HomepageProps) {
  const navigate = useNavigate();

  const handleCreateAccount = () => {
    if (onSignUp) {
      onSignUp();
      return;
    }

    navigate('/register');
  };

  const handleSignIn = () => {
    if (onLogin) {
      onLogin();
      return;
    }

    navigate('/login');
  };

  return (
    <div
      className="
        fixed
        inset-0
        overflow-hidden
        overscroll-none
        bg-transparent
        font-sans
        text-brand-text
        touch-none
      "
    >
      {/* =====================================================
          TOP LEFT BLUE CIRCLE
          Reduced size
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-[115px]
          -top-[125px]
          z-[1]
          h-[320px]
          w-[320px]
          rounded-full

          sm:-left-[115px]
          sm:-top-[135px]
          sm:h-[370px]
          sm:w-[370px]

          lg:-left-[125px]
          lg:-top-[155px]
          lg:h-[430px]
          lg:w-[430px]
        "
        style={{
          background:
            'linear-gradient(145deg, #00466D 0%, #00466D 62%, #1E92D2 100%)',
        }}
      >
        {/* Gold circular line lower than blue circle */}

        <div
          className="
            absolute
            left-[62px]
            top-[100px]
            h-full
            w-full
            rounded-full
            border-[2px]
            border-[#FFAD01]

            sm:left-[72px]
            sm:top-[118px]

            lg:left-[86px]
            lg:top-[138px]
          "
        />
      </div>

      {/* =====================================================
          TOP RIGHT TWO-TONE ORANGE / GOLD RING
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-[125px]
          -top-[150px]
          z-[1]
          h-[345px]
          w-[345px]
          rounded-full

          sm:-right-[125px]
          sm:-top-[165px]
          sm:h-[410px]
          sm:w-[410px]

          lg:-right-[140px]
          lg:-top-[205px]
          lg:h-[495px]
          lg:w-[495px]
        "
        style={{
          background:
            'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
        }}
      >
        {/* Hollow centre */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[68%]
            w-[68%]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-brand-bg
          "
        />
      </div>

      {/* =====================================================
          BOTTOM LEFT TWO-TONE ORANGE CIRCLE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-[150px]
          -left-[145px]
          z-[1]
          h-[345px]
          w-[345px]
          rounded-full

          sm:-bottom-[165px]
          sm:-left-[150px]
          sm:h-[410px]
          sm:w-[410px]

          lg:-bottom-[195px]
          lg:-left-[170px]
          lg:h-[495px]
          lg:w-[495px]
        "
        style={{
          background:
            'linear-gradient(135deg, #FFAD01 0%, #FFD784 100%)',
        }}
      />

      {/* =====================================================
          BOTTOM RIGHT TWO-TONE BLUE CIRCLE
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-[160px]
          -right-[145px]
          z-[1]
          h-[370px]
          w-[370px]
          rounded-full

          sm:-bottom-[175px]
          sm:-right-[150px]
          sm:h-[435px]
          sm:w-[435px]

          lg:-bottom-[210px]
          lg:-right-[180px]
          lg:h-[515px]
          lg:w-[515px]
        "
        style={{
          background:
            'linear-gradient(315deg, #00466D 0%, #00466D 60%, #1E92D2 100%)',
        }}
      >
        {/* Gold circular line lower than blue circle */}

        <div
          className="
            absolute
            -left-[78px]
            top-[105px]
            h-full
            w-full
            rounded-full
            border-[2px]
            border-[#FFAD01]

            sm:-left-[90px]
            sm:top-[120px]

            lg:-left-[105px]
            lg:top-[145px]
          "
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1280px]
          flex-col
          items-center
          justify-center
          px-6
          text-center
        "
      >
        {/* =================================================
            CONTENT GROUP
            Shifted upward together
        ================================================== */}

        <div
          className="
            flex
            w-full
            -translate-y-[44px]
            flex-col
            items-center

            sm:-translate-y-[54px]

            lg:-translate-y-[68px]
          "
        >
          {/* ===============================================
              MAIN TRUCITY LOGO
          ================================================ */}

          <div
            className="
              flex
              w-full
              max-w-[470px]
              items-center
              justify-center

              sm:max-w-[570px]

              lg:max-w-[650px]

              xl:max-w-[700px]
            "
          >
            <img
              src="/trucity-logo.png"
              alt="TruCity"
              draggable={false}
              className="
                block
                h-auto
                w-full
                select-none
                object-contain
              "
            />
          </div>

          {/* ===============================================
              DECORATIVE DOTS
          ================================================ */}

          <div
            aria-hidden="true"
            className="
              -mt-7
              flex
              items-center
              justify-center
              gap-4

              sm:-mt-9

              lg:-mt-11
            "
          >
            <span className="h-px w-10 bg-brand-primary/65" />

            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: '#00466D',
              }}
            />

            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: '#FFAD01',
              }}
            />

            <span
              className="h-3 w-3 rounded-full"
              style={{
                backgroundColor: '#1E92D2',
              }}
            />

            <span className="h-px w-10 bg-brand-primary/65" />
          </div>

          {/* ===============================================
              ACTION BUTTONS
          ================================================ */}

          <div
            className="
              mt-7
              flex
              w-full
              max-w-[490px]
              flex-col
              items-center
              justify-center
              gap-3

              sm:flex-row
              sm:gap-4
            "
          >
            {/* CREATE ACCOUNT */}

            <button
              type="button"
              onClick={handleCreateAccount}
              className="
                min-h-[52px]
                w-full
                rounded-[15px]
                border-0
                px-6
                text-[16px]
                font-medium
                text-white
                shadow-[0_8px_20px_rgba(0,70,109,0.14)]
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-[0_12px_26px_rgba(0,70,109,0.18)]

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25

                active:translate-y-0

                sm:w-[235px]
              "
              style={{
                background:
                  'linear-gradient(90deg, #00466D 0%, #1E92D2 100%)',
              }}
            >
              Create Account
            </button>

            {/* SIGN IN */}

            <button
              type="button"
              onClick={handleSignIn}
              className="
                min-h-[52px]
                w-full
                rounded-[15px]
                border-[1.5px]
                border-brand-primary
                bg-brand-bg
                px-6
                text-[16px]
                font-medium
                text-brand-primary
                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:bg-white
                hover:shadow-[0_8px_20px_rgba(0,70,109,0.07)]

                focus-visible:outline-none
                focus-visible:ring-4
                focus-visible:ring-brand-accent/25

                active:translate-y-0

                sm:w-[235px]
              "
            >
              Sign In
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}