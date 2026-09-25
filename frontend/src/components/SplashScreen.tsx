import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import splashVideo from '../assets/trucity-splash.mp4';

export interface SplashScreenProps {
  onFinish: () => void;
  fallbackDuration?: number;
  videoSrc?: string;
}

export function SplashScreen({
  onFinish,
  fallbackDuration = 8000,
  videoSrc = splashVideo,
}: SplashScreenProps) {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const hasFinishedRef =
    useRef(false);

  const finishTimerRef =
    useRef<number | null>(null);

  const [fadeOut, setFadeOut] =
    useState(false);

  const [videoReady, setVideoReady] =
    useState(false);

  /* =========================================================
     FINISH SPLASH
  ========================================================= */

  const finishSplash = useCallback(() => {
    if (hasFinishedRef.current) {
      return;
    }

    hasFinishedRef.current = true;

    setFadeOut(true);

    finishTimerRef.current =
      window.setTimeout(() => {
        onFinish();
      }, 500);
  }, [onFinish]);

  /* =========================================================
     FALLBACK TIMER
  ========================================================= */

  useEffect(() => {
    const fallbackTimer =
      window.setTimeout(() => {
        finishSplash();
      }, fallbackDuration);

    return () => {
      window.clearTimeout(fallbackTimer);

      if (
        finishTimerRef.current !== null
      ) {
        window.clearTimeout(
          finishTimerRef.current,
        );
      }
    };
  }, [
    fallbackDuration,
    finishSplash,
  ]);

  /* =========================================================
     AUTOPLAY
  ========================================================= */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const attemptPlayback =
      async () => {
        try {
          video.muted = true;
          video.currentTime = 0;

          await video.play();
        } catch (error) {
          console.warn(
            'Splash video autoplay was prevented:',
            error,
          );

          /*
           * Don't leave the application stuck if
           * the browser refuses autoplay.
           */
          setVideoReady(true);
        }
      };

    void attemptPlayback();
  }, []);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className={`
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        overflow-hidden
        transition-opacity
        duration-500
        ease-out

        ${
          fadeOut
            ? 'pointer-events-none opacity-0'
            : 'opacity-100'
        }
      `}
      style={{
        backgroundColor: '#FBF9F5',
      }}
      role="presentation"
    >
      <div
        className="
          relative
          flex
          h-[520px]
          w-[900px]
          max-h-[80dvh]
          max-w-[92vw]
          items-center
          justify-center
          overflow-hidden

          sm:h-[560px]
          sm:w-[940px]

          lg:h-[600px]
          lg:w-[1000px]
        "
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          controls={false}
          disablePictureInPicture
          onLoadedData={() => {
            setVideoReady(true);
          }}
          onCanPlay={() => {
            setVideoReady(true);
          }}
          onEnded={finishSplash}
          onError={() => {
            setVideoReady(true);
            finishSplash();
          }}
          className={`
            block
            h-auto
            w-full
            max-w-none
            object-contain
            transition-opacity
            duration-300

            ${
              videoReady
                ? 'opacity-100'
                : 'opacity-0'
            }
          `}
          style={{
            transform:
              'translateY(-8%) scale(1.12)',

            clipPath:
              'inset(0 11% 0 11%)',
          }}
        />

        {!videoReady && (
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
            "
            style={{
              backgroundColor:
                '#FBF9F5',
            }}
          />
        )}
      </div>
    </div>
  );
}
