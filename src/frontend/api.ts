import axios from 'restyped-axios'
import { API } from '../shared/api';

export const api = axios.create<API>({
  baseURL: './api/'
})
