import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { Platform } from 'react-native';

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  filename: string;
  size: number;
}

export class MediaService {
  static async pickImage(): Promise<MediaAttachment | null> {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return this.uploadMedia(result.assets[0], 'image');
    }

    return null;
  }

  static async pickVideo(): Promise<MediaAttachment | null> {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      return this.uploadMedia(result.assets[0], 'video');
    }

    return null;
  }

  static async pickDocument(): Promise<MediaAttachment | null> {
    if (Platform.OS === 'web') {
      // Web file input fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt';
      
      return new Promise((resolve) => {
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const attachment = await this.uploadWebFile(file);
            resolve(attachment);
          } else {
            resolve(null);
          }
        };
        input.click();
      });
    }

    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword', 'text/plain'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets[0]) {
      return this.uploadMedia(result.assets[0], 'file');
    }

    return null;
  }

  private static async uploadWebFile(file: File): Promise<MediaAttachment | null> {
    const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return {
      id: fileId,
      type: 'file',
      url: publicUrl,
      filename: file.name,
      size: file.size,
    };
  }

  private static async uploadMedia(
    asset: ImagePicker.ImagePickerAsset | DocumentPicker.DocumentPickerAsset,
    type: 'image' | 'video' | 'file'
  ): Promise<MediaAttachment | null> {
    try {
      const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = `${fileId}_${asset.name || 'file'}`;
      
      // Read file as base64 for upload
      const fileUri = 'uri' in asset ? asset.uri : '';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, fileContent, {
          contentType: asset.mimeType || 'application/octet-stream',
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      return {
        id: fileId,
        type,
        url: publicUrl,
        filename: asset.name || 'file',
        size: asset.size || 0,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }
}