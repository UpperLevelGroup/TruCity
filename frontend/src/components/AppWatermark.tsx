import watermarkImage from '../assets/trucity-city-watermark.png';

export default function AppWatermark() {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        fixed
        inset-x-0
        bottom-0
        z-0
        flex
        h-[330px]
        items-end
        justify-center
        overflow-hidden

        sm:h-[380px]
        lg:h-[430px]
      "
    >
      <img
        src={watermarkImage}
        alt=""
        draggable={false}
        className="
          block
          w-[1100px]
          max-w-none
          select-none
          object-contain
          opacity-[0.08]

          sm:w-[1450px]
          lg:w-[1800px]
        "
        style={{
          transform: 'translateY(34%)',
        }}
      />
    </div>
  );
}
