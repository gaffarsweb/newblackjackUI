// components/Header.js
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  InputBase,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import Header_logo from '../assets/img/Header_logo.png';
import Small_logo from '../assets/img/small_logo.png';
import bitImg from '../assets/img/bit.svg';
import profileIcon from '../assets/img/pajamas_profile.png';
import notificationIcon from '../assets/img/lucide_bell.png';
import chatIcon from '../assets/img/proicons_chat.png';

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isSmallTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: '#0C1110',
          border: "2px solid #0e1c2cff",
          boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.6)'
        }}
      >
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2, md: 3 },
            minHeight: { xs: 56, sm: 64 },
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
        {/* Mobile Layout */}
        {isMobile ? (
         <>
            {/* Top Row - Logo and Menu */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center"
              width="100%"
              sx={{ mb: 1 }}
            >
              {/* Logo */}
                <Typography 
                    variant="h6" 
                    sx={{ 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    }} 
                    onClick={() => window.location.reload()}
                >
                    <img
                    src={Small_logo}
                    alt="Small logo"
                    style={{
                        height: '32px',
                        width: 'auto',
                        marginTop : "10px",
                        marginLeft : "10px"
                    }}
                    />
                </Typography>


                {/* Balance and Wallet */}
                <Box 
                display="flex" 
                alignItems="center" 
                gap={isSmallTablet ? 1 : 2}
                sx={{ flexShrink: 1 }}
                >
                <Button
                    variant="outlined"
                    color="inherit"
                    endIcon={<ExpandMore />}
                    sx={{
                    fontWeight: 'bold',
                    borderColor: '#555',
                    color: 'white',
                    border: 'none',
                    textTransform: 'none',
                    minWidth: 'auto',
                    fontSize: isSmallTablet ? '0.8rem' : '1rem',
                    }}
                >
                    <div>0.00000000</div>
                    <img
                    src={bitImg}
                    alt="bit icon"
                    style={{ 
                        height: isSmallTablet ? "16px" : "20px", 
                        width: isSmallTablet ? "16px" : "20px", 
                        marginLeft: "5px" 
                    }}
                    />
                </Button>
                <Button
                    variant="contained"
                    sx={{
                    backgroundColor: '#0BF191',
                    textTransform: 'none',
                    color: 'black',
                    fontSize: isSmallTablet ? '0.8rem' : '1rem',
                    minWidth: 'auto',
                    '&:hover': {
                        backgroundColor: '#0ae481',
                    },
                    }}
                >
                    Wallet
                </Button>
                </Box> 
                <Box display="flex" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <img 
                        src={notificationIcon} 
                        alt="notification Icon" 
                        style={{ width: 24, height: 24 }} 
                        />
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        <img 
                        src={profileIcon} 
                        alt="profile Icon" 
                        style={{ width: 24, height: 24 }} 
                        />
                    </Box>
                </Box>
            </Box> 
          </>
        ) : (
          /* Tablet and Desktop Layout */
          <>
            {/* Logo */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                cursor: 'pointer',
                flexShrink: 0,
              }} 
              onClick={() => window.location.reload()}
            >
              <img
                src={Header_logo}
                alt="Header logo"
                style={{
                  height: isSmallTablet ? '32px' : '40px',
                  width: 'auto',
                }}
              />
            </Typography>

            {/* Balance and Wallet */}
            <Box 
              display="flex" 
              alignItems="center" 
              gap={isSmallTablet ? 1 : 2}
              sx={{ flexShrink: 1 }}
            >
              <Button
                variant="outlined"
                color="inherit"
                endIcon={<ExpandMore />}
                sx={{
                  fontWeight: 'bold',
                  borderColor: '#555',
                  color: 'white',
                  border: 'none',
                  textTransform: 'none',
                  minWidth: 'auto',
                  fontSize: isSmallTablet ? '0.8rem' : '1rem',
                }}
              >
                <div>0.00000000</div>
                <img
                  src={bitImg}
                  alt="bit icon"
                  style={{ 
                    height: isSmallTablet ? "16px" : "20px", 
                    width: isSmallTablet ? "16px" : "20px", 
                    marginLeft: "5px" 
                  }}
                />
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#0BF191',
                  textTransform: 'none',
                  color: 'black',
                  fontSize: isSmallTablet ? '0.8rem' : '1rem',
                  minWidth: 'auto',
                  '&:hover': {
                    backgroundColor: '#0ae481',
                  },
                }}
              >
                Wallet
              </Button>
            </Box>

            {/* Search and Icons */}
            <Box 
              display="flex" 
              alignItems="center" 
              gap={isSmallTablet ? 0.5 : 1}
              sx={{ flexShrink: 0 }}
            >
              {/* Search Box */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: 'transparent',
                  color: 'white',
                  height: 32,
                  width: isTablet ? 100 : isSmallTablet ? 120 : 160,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  },
                }}
              >
                <Search sx={{ fontSize: 18, color: 'white', mr: 0.5 }} />
                <InputBase
                  placeholder="Search"
                  sx={{
                    fontSize: 14,
                    color: 'white',
                    width: '100%',
                    '& input::placeholder': {
                      color: 'rgba(255,255,255,0.6)',
                    },
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Box>

              {/* Icons */}
              <IconButton 
                color="inherit" 
                aria-label="Account"
                size={isSmallTablet ? "small" : "medium"}
                sx={{ p: isSmallTablet ? 0.5 : 1 }}
              >
                <img
                  src={profileIcon}
                  alt="profile Icon"
                  style={{ 
                    width: isSmallTablet ? 18 : 24, 
                    height: isSmallTablet ? 18 : 24 
                  }}
                />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Notifications"
                size={isSmallTablet ? "small" : "medium"}
                sx={{ p: isSmallTablet ? 0.5 : 1 }}
              >
                <img
                  src={notificationIcon}
                  alt="notification Icon"
                  style={{ 
                    width: isSmallTablet ? 18 : 24, 
                    height: isSmallTablet ? 18 : 24 
                  }}
                />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Chat"
                size={isSmallTablet ? "small" : "medium"}
                sx={{ p: isSmallTablet ? 0.5 : 1 }}
              >
                <img
                  src={chatIcon}
                  alt="chat Icon"
                  style={{ 
                    width: isSmallTablet ? 18 : 24, 
                    height: isSmallTablet ? 18 : 24 
                  }}
                />
              </IconButton>
            </Box>
          </>
        )}
              </Toolbar>
      </AppBar>
    </>
  );
}

export default Header;