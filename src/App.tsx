import React, { useMemo, useRef, useState } from 'react';
import './App.css';
import { Box, Card, CardActions, CardContent, Checkbox, Chip, Collapse, FormControlLabel, InputBase, List, ListItem, ListItemIcon, Typography, useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';

import * as _ from "lodash";

import HN_POSTS_FILE from './HN_POSTS_CATEGORIZED.json'

import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const navItems = ['GITHUB'];

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export function DrawerAppBar(props: { handleMenu: React.MouseEventHandler<HTMLButtonElement> | undefined; narrow?: boolean }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={props.narrow ? {} : { flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Hacker News Who is Hiring
            <Typography variant="overline" sx={{ marginLeft: "20px" }}>January 2024</Typography>
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Button key={item} sx={{ color: '#fff' }}>
                <a href="https://www.github.com/bernawil">{item}</a>
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  );
}


function App() {
  const divRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(true);

  const [filters, setFilters] = useState({
    remote: false, global: false, compensation: false, technologies: [], positions: [], locations: []
  });

  const HN_POSTS = useMemo(() => {
    return HN_POSTS_FILE.filter(post => {
      if (filters.remote && !post.metadata.is_remote) {
        return false
      }

      if (filters.compensation && !(post.metadata.compensation?.min || post.metadata.compensation?.max)) {
        return false;
      }

      if (filters.global && !post.metadata.is_global_remote) {
        return false;
      }

      if (filters.positions.length) {
        if (!_.intersection(filters.positions, post.categorized_positions).length) {
          return false;
        }
      }

      if (filters.technologies.length) {
        if (!_.intersection(filters.technologies, post.categorized_tech).length) {
          return false;
        }
      }

      if (filters.locations.length) {
        if (!_.intersection(filters.locations, post.metadata.remote_only_location).length) {
          return false;
        }
      }

      return true;
    })
  }, [filters]);

  const [search, setSearch] = useState('');

  const categories = useMemo(() => {
    let tech: any = {}
    let positions: any = {}
    let locations: any = {}
    HN_POSTS_FILE.forEach(post => {
      post.categorized_tech.sort().forEach((t: string) => {
        if (search.length && !t.includes(search)) {
          return
        }
        tech[t as keyof Object] = tech[t as keyof Object] === undefined ? 1 : (++tech[t as keyof Object]);
      })
      post.categorized_positions.sort().forEach((t: string) => {
        if (search.length && !t.includes(search)) {
          return
        }
        positions[t as keyof Object] = positions[t as keyof Object] === undefined ? 1 : positions[t as keyof Object] + 1;
      })
      if (post.metadata.remote_only_location) {
        post.metadata.remote_only_location.sort().forEach((t: string) => {
          if (search.length && !t.includes(search)) {
            return
          }
          locations[t as keyof Object] = locations[t as keyof Object] === undefined ? 1 : locations[t as keyof Object] + 1;
        })
      }
    })
    return {
      tech: Object.entries(tech), positions: Object.entries(positions), locations: Object.entries(locations)
    }
  }, [search]);

  const [techListOpen, setTechListOpen] = useState(false);
  const [positionsListOpen, setPositionsListOpen] = useState(false);
  const [locationsListOpen, setLocationsListOpen] = useState(false);

  const isNarrowScreen = useMediaQuery('(max-width:600px)');

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <div className="App-header" style={{ paddingTop: '60px' }} ref={divRef}>
        <DrawerAppBar narrow={isNarrowScreen} handleMenu={() => setMenuOpen(!menuOpen)} />

        <div className={isNarrowScreen ? 'flex-vertical-mobile' : 'grid'}>
          <div className='grid-left' style={{ paddingLeft: '6px', marginTop: '10px' }}>

            <Card>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Filter…"
                  inputProps={{ 'aria-label': 'filter' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </Search>
            </Card>

            {filters.technologies.map(f => (<Chip size="small" label={f} sx={{ marginRight: '2px' }}
              onDelete={() => {
                setFilters({ ...filters, technologies: _.xor(filters.technologies, [f]) as any })
              }}
            />))}
            {filters.positions.map(f => (<Chip size="small" label={f} sx={{ marginRight: '2px' }}
              onDelete={() => {
                setFilters({ ...filters, positions: _.xor(filters.positions, [f]) as any })
              }}
            />))}
            {filters.locations.map(f => (<Chip size="small" label={f} sx={{ marginRight: '2px' }}
              onDelete={() => {
                setFilters({ ...filters, locations: _.xor(filters.locations, [f]) as any })
              }}
            />))}

            <Card sx={{ marginTop: '8px', padding: "4px" }}>
              <FormControlLabel
                sx={{ width: '100%' }}
                label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>Remote 💻</Typography>}
                control={<Checkbox
                  checked={filters.remote}
                  onChange={() => {
                    setFilters({ ...filters, remote: !filters.remote })
                  }}
                />}
              />

              <FormControlLabel
                sx={{ width: '100%' }}
                label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>Lists Compensation 💰</Typography>}
                control={<Checkbox
                  checked={filters.compensation}
                  onChange={() => {
                    setFilters({ ...filters, compensation: !filters.compensation })
                  }}
                />}
              />

              <FormControlLabel
                sx={{ width: '100%' }}
                label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>Global Remote 🌎</Typography>}
                control={<Checkbox
                  checked={filters.global}
                  onChange={() => {
                    setFilters({ ...filters, global: !filters.global })
                  }}
                />}
              />

            </Card>

            <List>
              <Card>
                <ListItemButton onClick={() => setTechListOpen(!techListOpen)}>
                  <ListItemIcon> {!techListOpen ? <KeyboardArrowRight /> : <KeyboardArrowDown />}</ListItemIcon>
                  <ListItemText><Typography variant="overline">Technologies</Typography></ListItemText>
                </ListItemButton>
                <Collapse in={techListOpen} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {categories.tech.map((c: any) =>
                    (<ListItem sx={{ paddingTop: 0.3, paddingBottom: 0.3 }} key={`${c[0]}-menu-item`}>
                      <FormControlLabel
                        sx={{ width: '100%' }}
                        label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>{c[0]} ({c[1]})</Typography>}
                        control={<Checkbox
                          checked={!!filters.technologies.length && filters.technologies.includes(c[0] as never)}
                          onChange={() => {
                            setFilters({ ...filters, technologies: _.xor(filters.technologies, [c[0]]) as any })
                          }}
                        />}
                      />
                    </ListItem>))
                    }
                  </List>
                </Collapse>
              </Card>
            </List>

            <List>
              <Card>
                <ListItemButton onClick={() => setPositionsListOpen(!positionsListOpen)}>
                  <ListItemIcon> {!positionsListOpen ? <KeyboardArrowRight /> : <KeyboardArrowDown />}</ListItemIcon>
                  <ListItemText><Typography variant="overline">Positions</Typography></ListItemText>
                </ListItemButton>
                <Collapse in={positionsListOpen} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {categories.positions.map((c: any) =>
                    (<ListItem sx={{ paddingTop: 0.3, paddingBottom: 0.3 }} key={`${c[0]}-menu-item`}>
                      <FormControlLabel
                        sx={{ width: '100%' }}
                        label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>{c[0]} ({c[1]})</Typography>}
                        control={<Checkbox
                          checked={!!filters.positions.length && filters.positions.includes(c[0] as never)}
                          onChange={() => {
                            setFilters({ ...filters, positions: _.xor(filters.positions, [c[0]]) as any })
                          }}
                        />}
                      />
                    </ListItem>))
                    }
                  </List>
                </Collapse>
              </Card>
            </List>

            <List>
              <Card>
                <ListItemButton onClick={() => setLocationsListOpen(!locationsListOpen)}>
                  <ListItemIcon> {!locationsListOpen ? <KeyboardArrowRight /> : <KeyboardArrowDown />}</ListItemIcon>
                  <ListItemText><Typography variant="overline">Locations</Typography></ListItemText>
                </ListItemButton>
                <Collapse in={locationsListOpen} timeout="auto" unmountOnExit>
                  <List dense disablePadding>
                    {categories.locations.map((c: any) =>
                    (<ListItem sx={{ paddingTop: 0.3, paddingBottom: 0.3 }} key={`${c[0]}-menu-item`}>
                      <FormControlLabel
                        sx={{ width: '100%' }}
                        label={<Typography variant="overline" fontSize={"10px"} marginLeft={"20px"}>{c[0]} ({c[1]})</Typography>}
                        control={<Checkbox
                          checked={!!filters.locations.length && filters.locations.includes(c[0] as never)}
                          onChange={() => {
                            setFilters({ ...filters, locations: _.xor(filters.locations, [c[0]]) as any })
                          }}
                        />}
                      />
                    </ListItem>))
                    }
                  </List>
                </Collapse>
              </Card>
            </List>

          </div>

          <div className='grid-right'>
            <List disablePadding>
              {HN_POSTS.map(post => <ListItem key={post.id} >
                <Card className="cls-no-bottom">
                  <CardContent>
                    <Box>
                      <Typography variant="body2">{post.description}</Typography>
                    </Box>
                    <div >
                      <CardActions sx={{ paddingLeft: 0 }}>
                        {post.metadata.is_remote && (<Chip label="Remote 💻" sx={{ marginRight: '1px' }} />)}
                        {post.metadata.is_global_remote && (<Chip label={"🌎 Anywhere "} sx={{ marginRight: '1px' }} />)}
                        {(post.metadata.compensation?.min || post.metadata.compensation?.max) && (<Chip label="Lists Compensation 💰" sx={{ marginRight: '1px' }} />)}
                      </CardActions>
                      {post.categorized_positions?.length ?
                        <CardActions sx={{ paddingLeft: 0 }}>
                          {post.categorized_positions && post.categorized_positions.map((position: string) => (<Chip variant="outlined" key={position} label={position} sx={{ marginRight: '1px' }} />))}
                        </CardActions>
                        : null
                      }
                      {
                        post.categorized_tech?.length ?
                          <CardActions sx={{ paddingLeft: 0 }}>
                            {post.categorized_tech && post.categorized_tech.map((tech: string) => (<Chip key={post.id + tech} label={tech} sx={{ marginRight: '1px' }} />))}
                          </CardActions>
                          : null
                      }
                      {
                        post.metadata.remote_only_location?.length ?
                          <CardActions sx={{ paddingLeft: 0 }}>
                            {post.metadata.remote_only_location.sort().map((item: string) => (<Chip key={post.id + item} label={item} sx={{ marginRight: '1px' }} />))}
                          </CardActions>
                          : null
                      }
                      {
                        post.metadata.compensation ?
                          <CardActions sx={{ paddingLeft: 0 }}>
                            {post.metadata.compensation.min ? (<Chip key={post.id + 'min'} label={'$' + post.metadata.compensation.min.toLocaleString()} sx={{ marginRight: '1px' }} />) : null}
                            {post.metadata.compensation.max ? (<Chip key={post.id + 'max'} label={'$' + post.metadata.compensation.max.toLocaleString()} sx={{ marginRight: '1px' }} />) : null}
                          </CardActions>
                          : null
                      }
                    </div>
                  </CardContent>
                </Card>
              </ListItem>)}
            </List>
          </div>
        </div>
      </div>
    </ThemeProvider >
  );
}

export default App;
