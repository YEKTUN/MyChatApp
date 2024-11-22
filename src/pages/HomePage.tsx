import {View, Text} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Messages from '../homepagepages/Messages';

import Profile from '../homepagepages/Profile';
import Story from '../homepagepages/Notes';

const Tab = createBottomTabNavigator();
const HomePage = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {backgroundColor: 'black'},
      }}>
      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="message" size={24} color="white" />
          ),
        }}
      />

      <Tab.Screen
        name="Notes"
        component={Story}
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="history" size={24} color="green" />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: () => (
            <MaterialIcons name="person" size={24} color="white" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomePage;
