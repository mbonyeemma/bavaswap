import React, {useState} from 'react';




function Footer({history}) {
  const [isShowing, setShowing] = useState (false);

  const openProfile = () => {
    setShowing (true);
  };
  const Login = () => {
    setShowing (false);
  };

  return (
          <footer className="footer__1">
            <p className="text-center">
                Copyright © 2021. Created with love by hodlassets
            </p>
        </footer>
  );
}

export default Footer;
