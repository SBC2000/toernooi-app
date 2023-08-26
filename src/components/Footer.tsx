import footer from './footer.png'

export default function Footer() {
  return (
    <div className="w-full border-t-2 border-sbcOrange-500 h-10">
      <div className="h-full border-t-4 border-sbcBlue-500 mt-0.5 flex justify-center">
        <img src={footer} alt="SBC2000" className="h-full p-2"></img>
      </div>
    </div>
  )
}
