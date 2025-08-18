import { prisma } from '@/lib/prisma';
import { executeWithRetry } from '@/lib/db-utils';

export const contactService = {
  // Enviar un nuevo mensaje de contacto
  async sendMessage(messageData) {
    try {
      const message = await prisma.mensajes_contacto.create({
        data: {
          nombre: messageData.nombre,
          email: messageData.email,
          asunto: messageData.asunto,
          mensaje: messageData.mensaje,
        },
      });
      
      return {
        success: true,
        message: 'Mensaje enviado correctamente',
        data: message
      };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return {
        success: false,
        message: 'Error al enviar el mensaje',
        error: error.message
      };
    }
  },

  // Obtener todos los mensajes (para el admin)
  async getAllMessages() {
    try {
      const messages = await executeWithRetry(async () => {
        return await prisma.mensajes_contacto.findMany({
          orderBy: {
            creado_en: 'desc'
          }
        });
      });
      
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error('Error obteniendo mensajes:', error);
      return {
        success: false,
        message: 'Error al obtener los mensajes',
        error: error.message
      };
    }
  },

  // Obtener mensajes no leídos
  async getUnreadMessages() {
    try {
      const messages = await prisma.mensajes_contacto.findMany({
        where: {
          leido: false
        },
        orderBy: {
          creado_en: 'desc'
        }
      });
      
      return {
        success: true,
        data: messages
      };
    } catch (error) {
      console.error('Error obteniendo mensajes no leídos:', error);
      return {
        success: false,
        message: 'Error al obtener los mensajes no leídos',
        error: error.message
      };
    }
  },

  // Marcar mensaje como leído
  async markAsRead(messageId) {
    try {
      const message = await prisma.mensajes_contacto.update({
        where: { id: parseInt(messageId) },
        data: { leido: true }
      });
      
      return {
        success: true,
        message: 'Mensaje marcado como leído',
        data: message
      };
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
      return {
        success: false,
        message: 'Error al marcar el mensaje como leído',
        error: error.message
      };
    }
  },

  // Responder a un mensaje
  async respondToMessage(messageId, respuesta) {
    try {
      const message = await prisma.mensajes_contacto.update({
        where: { id: parseInt(messageId) },
        data: {
          respuesta: respuesta,
          respondido: true,
          fecha_respuesta: new Date()
        }
      });
      
      return {
        success: true,
        message: 'Respuesta enviada correctamente',
        data: message
      };
    } catch (error) {
      console.error('Error respondiendo al mensaje:', error);
      return {
        success: false,
        message: 'Error al enviar la respuesta',
        error: error.message
      };
    }
  },

  // Eliminar un mensaje
  async deleteMessage(messageId) {
    try {
      await prisma.mensajes_contacto.delete({
        where: { id: parseInt(messageId) }
      });
      
      return {
        success: true,
        message: 'Mensaje eliminado correctamente'
      };
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
      return {
        success: false,
        message: 'Error al eliminar el mensaje',
        error: error.message
      };
    }
  }
};


