import UserNotifications
import Intents

class NotificationService: UNNotificationServiceExtension {
    
    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?
    
    override func didReceive(_ request: UNNotificationRequest,
                             withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)
        
        guard let bestAttemptContent = bestAttemptContent else {
            contentHandler(request.content)
            return
        }
        
        // Extract sender info from push payload
        let userInfo = request.content.userInfo
        let senderName = userInfo["sender_name"] as? String ?? bestAttemptContent.title
        let senderId = userInfo["sender_id"] as? String ?? "unknown"
        let avatarUrlString = userInfo["image_url"] as? String ?? ""
        let notificationType = userInfo["type"] as? String ?? ""
        
        // Only use communication style for chat messages
        let isChatMessage = notificationType == "chat_message" || notificationType == "incoming_call"
        
        if isChatMessage && !senderName.isEmpty {
            // Download avatar then create communication notification
            downloadAvatar(from: avatarUrlString) { avatarImage in
                self.createCommunicationNotification(
                    content: bestAttemptContent,
                    senderName: senderName,
                    senderId: senderId,
                    avatarImage: avatarImage,
                    contentHandler: contentHandler
                )
            }
        } else {
            // For non-chat notifications, just attach the image if available
            if !avatarUrlString.isEmpty, let url = URL(string: avatarUrlString) {
                downloadImage(from: url) { attachment in
                    if let attachment = attachment {
                        bestAttemptContent.attachments = [attachment]
                    }
                    contentHandler(bestAttemptContent)
                }
            } else {
                contentHandler(bestAttemptContent)
            }
        }
    }
    
    override func serviceExtensionTimeWillExpire() {
        if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
    
    // MARK: - Communication Notification
    
    private func createCommunicationNotification(
        content: UNMutableNotificationContent,
        senderName: String,
        senderId: String,
        avatarImage: INImage?,
        contentHandler: @escaping (UNNotificationContent) -> Void
    ) {
        // Create the sender as an INPerson
        let handle = INPersonHandle(value: senderId, type: .unknown)
        let sender = INPerson(
            personHandle: handle,
            nameComponents: nil,
            displayName: senderName,
            image: avatarImage,
            contactIdentifier: nil,
            customIdentifier: "zivo-user-\(senderId)"
        )
        
        // Create the message intent
        let intent = INSendMessageIntent(
            recipients: nil,
            outgoingMessageType: .outgoingMessageText,
            content: content.body,
            speakableGroupName: nil,
            conversationIdentifier: "zivo-chat-\(senderId)",
            serviceName: "ZIVO",
            sender: sender,
            attachments: nil
        )
        
        // Set the sender's avatar on the intent
        if let avatarImage = avatarImage {
            intent.setImage(avatarImage, forParameterNamed: \.sender)
        }
        
        // Donate the interaction so Siri learns about this contact
        let interaction = INInteraction(intent: intent, response: nil)
        interaction.direction = .incoming
        interaction.donate(completion: nil)
        
        // Update the notification content with the communication style
        do {
            let updatedContent = try content.updating(from: intent)
            contentHandler(updatedContent)
        } catch {
            // Fallback to regular notification if communication style fails
            contentHandler(content)
        }
    }
    
    // MARK: - Avatar Download
    
    private func downloadAvatar(from urlString: String, completion: @escaping (INImage?) -> Void) {
        guard !urlString.isEmpty, let url = URL(string: urlString) else {
            completion(nil)
            return
        }
        
        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            guard let data = data, error == nil else {
                completion(nil)
                return
            }
            completion(INImage(imageData: data))
        }
        task.resume()
    }
    
    // MARK: - Image Attachment (for non-chat notifications)
    
    private func downloadImage(from url: URL, completion: @escaping (UNNotificationAttachment?) -> Void) {
        let task = URLSession.shared.downloadTask(with: url) { localURL, response, error in
            guard let localURL = localURL, error == nil else {
                completion(nil)
                return
            }
            
            let ext: String
            if let mimeType = (response as? HTTPURLResponse)?.mimeType {
                switch mimeType {
                case "image/png": ext = "png"
                case "image/gif": ext = "gif"
                case "image/webp": ext = "webp"
                default: ext = "jpg"
                }
            } else {
                ext = "jpg"
            }
            
            let tmpFile = FileManager.default.temporaryDirectory
                .appendingPathComponent(UUID().uuidString)
                .appendingPathExtension(ext)
            
            do {
                try FileManager.default.moveItem(at: localURL, to: tmpFile)
                let attachment = try UNNotificationAttachment(identifier: "avatar", url: tmpFile, options: nil)
                completion(attachment)
            } catch {
                completion(nil)
            }
        }
        task.resume()
    }
}
