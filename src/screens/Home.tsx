import React, { useEffect, useState } from "react";
import {
  Text,
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Box,
  Button,
  Alert,
  useToast,
  Input,
} from "native-base";
import { Image } from "react-native";
import ModalDropdown from "react-native-modal-dropdown";
var csimg = require("../assets/csicon.jpg");
import { DarkTheme, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, get, ref, child } from "firebase/database";

import { THEME } from "../theme";

import  UserParams  from "./Menu";

import db from "../banco/config.js";

// Define the config
const config = {
  useSystemColorMode: true,
  initialColorMode: "system",
};

// extend the theme
export const theme = extendTheme({ config });
type MyThemeType = typeof theme;
declare module "native-base" {
  interface ICustomTheme extends MyThemeType {}
}

export interface UserParams {
  userName: string;
}

export default function App() {
  const navigation = useNavigation();

  const [users, setUsers] = useState<[]>([]);
  const [selectedOption, setSelectedOption] = useState("");

  const [nickUser, setNickUser] = React.useState("");
  const handleChange = (text: string) => {
    setNickUser(text);
  };

  async function handleUserBlur() {
    try {
      await AsyncStorage.setItem('nickUser', nickUser);
    } catch (error) {
      console.error(error);
    }
  }

  const [admin, setAdmin] = useState(false);

  const handleDropdownSelect = (index: number, value: string) => {
    setSelectedOption(value);
  };

  const toast = useToast();

  function handleOpenMenu({ userName }: UserParams) {
    if (!admin && nickUser == "201240227") {
      setAdmin(true);
      return;
    }
    if (nickUser != "") {
      navigation.navigate("menu", { userName });
    } else {
      //Mensagem para selecionar usuário
    }
  }

  function loadUsers() {
    const arUsers: [] = [];
    // console.log(db);
    try {
      get(child(db, `/`))
        .then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach(function (childSnapshot) {
              var childKey = childSnapshot.key;
              arUsers.push(childKey);
            });
            setUsers(arUsers);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } catch {
      console.log("Não conseguiu se comunicar com o firebase");
    }
  }

  useEffect(() => {
    async function getSavedNickUser() {
      try {
        const savedNickUser = await AsyncStorage.getItem('nickUser');
        setNickUser(savedNickUser || ''); // caso não exista valor salvo, inicializa com uma string vazia
      } catch (error) {
        console.error(error);
      }
    }
    getSavedNickUser();

    loadUsers();
  }, []);

  return (
    <NativeBaseProvider>
      <Center
        _dark={{ bg: "blueGray.900" }}
        _light={{ bg: "blueGray.50" }}
        px={4}
        flex={1}
      >
        <VStack space={5} alignItems="center">
          {/* <NativeBaseIcon /> */}
          <Image
            source={csimg}
            style={{ width: 150, height: 150 }}
            alt="main icon"
          />
          <Heading size="lg">My skins</Heading>

          <HStack space={2} alignItems="center">
            <Box
              _web={{
                _text: {
                  fontFamily: "monospace",
                  fontSize: "sm",
                },
              }}
              _dark={{ bg: "blueGray.800" }}
              _light={{ bg: "blueGray.200" }}
            ></Box>
            {admin ? (
              <Box flexDir={"row"}>
                <ModalDropdown
                  options={users}
                  onSelect={handleDropdownSelect}
                  dropdownStyle={{ width: 250, height: 300 }}
                  dropdownTextStyle={{ fontSize: 20 }}
                  textStyle={{ fontSize: 20, color: "#447CFA" }}
                  defaultValue={"Select a user..."}
                  saveScrollPosition={false}
                />
                <Button
                  onPress={() => handleOpenMenu({ userName: selectedOption })}
                  ml={3}
                >
                  Ir para o menu
                </Button>
              </Box>
            ) : (
              <Box flexDir={"column"} width={"70%"}>
                {" "}
                <Input
                  value={nickUser}
                  w="100%"
                  onChangeText={handleChange}
                  onBlur={handleUserBlur}
                  placeholder="Your steam login..."
                  mb={3}
                />
                <Button onPress={() => handleOpenMenu({ userName: nickUser })}>
                  Ir para o menu
                </Button>
              </Box>
            )}
          </HStack>
          <ToggleDarkMode />
        </VStack>
      </Center>
    </NativeBaseProvider>
  );
}

// Color Switch Component
function ToggleDarkMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2} alignItems="center">
      <Text>Dark</Text>
      <Switch
        isChecked={colorMode === "light"}
        onToggle={toggleColorMode}
        aria-label={
          colorMode === "light" ? "switch to dark mode" : "switch to light mode"
        }
      />
      <Text>Light</Text>
    </HStack>
  );
}
