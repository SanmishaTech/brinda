import { Outlet } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const AuthLayout = () => {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-10">
      <Card className="w-full max-w-6xl overflow-hidden p-0">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
          {/* Left: Login Form */}
          <div className="p-6 md:p-10">
            <Outlet />
          </div>

          {/* Right: Text Content */}
          <div className="relative hidden bg-gradient-to-br from-purple-600 via-pink-500 to-red-400 text-white  md:flex items-center justify-center bg-muted p-4 md:p-6">
            <div className="max-w-xl text-sm md:text-base space-y-3">
              <h2 className="text-xl md:text-2xl font-bold text-center md:text-left">
                Welcome to MYBRINDA.COM
              </h2>

              <section>
                <h3 className="text-lg font-semibold mb-1">
                  About Brinda Health Care
                </h3>
                <p>
                  MYBRINDA.COM is a company established by health care
                  professionals aspiring to bring better health and a brighter
                  future for people worldwide. Founders of our company are
                  successful in their chosen fields, having achieved great
                  heights of success early in life. They now want to share their
                  knowledge, experience, and resources with the people and
                  provide an opportunity to achieve staggering success in life.
                </p>
                <p>
                  The company is active in three areas: health, beauty, and
                  personal care products.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-1">
                  OUR MISSION AND VISION
                </h3>
                <p>
                  MYBRINDA.COM is a buzzword all around the globe. We are an
                  organization committed to providing quality products at a fair
                  price. MYBRINDA.COM aims to share profits in terms of health
                  and wealth with all our associates and bring them closer to
                  the dream of becoming a millionaire.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-1">PEOPLE</h3>
                <p>
                  We consider people as our greatest asset. At MYBRINDA.COM,
                  people are inspired to be the best they can be.
                </p>
              </section>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthLayout;
// import { Outlet } from "react-router-dom";
// import { Card, CardContent } from "@/components/ui/card";

// const AuthLayout = () => {
//   return (
//     <div className="flex min-h-svh items-center justify-center bg-muted p-4 md:p-10">
//       <Card className="w-full max-w-6xl overflow-hidden shadow-xl p-0">
//         <CardContent className="grid grid-cols-1 md:grid-cols-2 p-0">
//           {/* Left: Login Form */}
//           <div className="p-6 md:p-10 bg-background">
//             <Outlet />
//           </div>

//           {/* Right: Branding/Info Section */}
//           <div className="relative hidden md:flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-400 text-white p-4 md:p-6">
//             <div className="max-w-xl text-sm md:text-base space-y-5 leading-relaxed">
//               <h2 className="text-2xl md:text-3xl font-bold text-center md:text-left">
//                 Welcome to <span className="underline">MY BRINDA.COM</span>
//               </h2>

//               <section>
//                 <h3 className="text-lg font-semibold mb-1">
//                   About Brinda Health Care
//                 </h3>
//                 <p>
//                   MY BRINDA.COM is a company established by healthcare
//                   professionals aspiring to bring better health and a brighter
//                   future for people worldwide.
//                 </p>
//                 <p>
//                   Our founders have excelled in their fields and now aim to
//                   share their knowledge, experience, and resources to empower
//                   others toward remarkable success.
//                 </p>
//                 <p>
//                   We operate in three key sectors: <strong>health</strong>,{" "}
//                   <strong>beauty</strong>, and{" "}
//                   <strong>personal care products</strong>.
//                 </p>
//               </section>

//               <section>
//                 <h3 className="text-lg font-semibold mb-1">
//                   Our Mission and Vision
//                 </h3>
//                 <p>
//                   MY BRINDA.COM is a global buzzword, representing our
//                   dedication to delivering quality products at fair prices and
//                   sharing health and wealth with our partners — helping them
//                   achieve their dream of becoming millionaires.
//                 </p>
//               </section>

//               <section>
//                 <h3 className="text-lg font-semibold mb-1">People</h3>
//                 <p>
//                   We believe people are our greatest asset. At MY BRINDA.COM,
//                   everyone is inspired to be the best version of themselves.
//                 </p>
//               </section>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default AuthLayout;
