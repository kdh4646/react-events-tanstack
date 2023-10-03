//check application is getting data
import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  /*
    0: not working
    above 0: getting data
  */
  const fetching = useIsFetching();

  return (
    <>
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
