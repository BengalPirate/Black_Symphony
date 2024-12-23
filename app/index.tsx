import StartScreen from './start'; // Adjust this path if StartScreen is in a different location
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);


export default StartScreen;
