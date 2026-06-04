import { StyleSheet } from 'react-native';
import { GRID_PADDING, GRID_WIDTH } from './constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6fb',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#263238',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 16,
    color: '#607d8b',
    textAlign: 'center',
  },
  grid: {
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
    backgroundColor: '#dce3ef',
    borderRadius: 16,
    padding: GRID_PADDING,
  },
  tile: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 12,
    backgroundColor: '#3f51b5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  winText: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
  button: {
    marginTop: 26,
    backgroundColor: '#009688',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
