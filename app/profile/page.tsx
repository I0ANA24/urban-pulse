import Image from "next/image";

export default function ProfilePage() {
  return (
    <div className="w-full flex flex-col gap-12 mt-7">
      <section className="w-full flex justify-around items-center">
        <div className="size-35 rounded-full overflow-hidden">
          <Image
            src="/profile.png"
            alt="Greta Bennett"
            width={140}
            height={140}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold font-montagu text-center leading-tight">
            Greta
            <br />
            Bennett
          </h1>

          <div className="flex justify-center items-center rounded-full px-3 py-1.5 h-8 bg-linear-to-b from-[#FFFADC]/50 to-[#FFF197]/50 shadow-[0px_11.3915px_22.3363px_rgba(255,227,42,0.19),inset_0px_-2px_1px_rgba(255,241,151,0.4)] backdrop-blur-[2px]">
            {[1, 2, 3].map((i) => (
              <svg
                key={`full-${i}`}
                className="w-5 h-5 text-yellow-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L4.053 9.384c-.783-.57-.38-1.81.588-1.81h4.161a1 1 0 00.951-.69l1.286-3.957z"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            ))}

            {[1, 2].map((i) => (
              <svg
                key={`empty-${i}`}
                className="w-5 h-5 text-yellow-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.447a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.368-2.447a1 1 0 00-1.175 0l-3.368 2.447c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L4.053 9.384c-.783-.57-.38-1.81.588-1.81h4.161a1 1 0 00.951-.69l1.286-3.957z"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="w-full mb-4 border border-[#383838]"></div>
        <p className="w-full flex">
          <span className="block font-bold">Bio:</span> 🌿 Plant lover | Yard
          Designer | Creator
          <br />I like to connect with people and give a lot of help!
        </p>
        <div className="w-full mt-4 border border-[#383838]"></div>
      </section>

      <div className="w-full flex flex-col justify-center items-center gap-6">
        <section className="w-full h-25 border-2 border-yellow-primary rounded-2xl flex items-center py-2 shadow-sm bg-[#1C1C1C]">
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Helped</h3>
            <p className="text-yellow-primary text-3xl font-bold">23</p>
          </div>
          <div className="w-px h-15 my-2 bg-yellow-secondary"></div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1">
            <h3 className="text-lg font-bold">Posts</h3>
            <p className="text-yellow-primary text-3xl font-bold">3</p>
          </div>
        </section>

        <section className="w-full h-25 border-2 border-yellow-primary rounded-2xl flex justify-between items-center py-2 px-6 shadow-sm bg-[#1C1C1C]">
          <div className="flex flex-col items-baseline justify-center gap-1">
            <h2 className="text-yellow-primary text-xl font-bold font-montagu">
              Best at
            </h2>
            <p className="text-xl">Gardening</p>
          </div>
          <div className="text-white w-12 h-12 flex items-center justify-center">
            <Image src="./sprout.svg" alt="icon" width={50} height={50} />
          </div>
        </section>

        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">
            Skills
          </h2>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Gardening
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Cooking
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              DIY
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Cooking
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Cooking
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Cooking
            </div>
          </div>
        </section>
        <section className="w-full min-h-25 border-2 border-yellow-primary rounded-2xl flex flex-col justify-center gap-2 items-baseline py-4 px-6 shadow-sm bg-[#1C1C1C]">
          <h2 className="text-yellow-primary text-xl font-bold font-montagu">
            Tools & Resources
          </h2>
          <div className="flex flex-col gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              White Paint
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Pans
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Flowers
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-primary"></span>
              Flower Fertilizer
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
